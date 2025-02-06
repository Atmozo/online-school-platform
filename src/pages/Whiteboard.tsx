import { useState, useEffect, useRef } from 'react';
import { 
  Pencil, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Undo, 
  Redo,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Socket } from 'socket.io-client';

interface WhiteboardProps {
  socket: Socket;
  roomId: string;
  userId: string;
}

interface DrawEvent {
  type: 'draw' | 'erase' | 'text' | 'shape';
  x: number;
  y: number;
  color?: string;
  size?: number;
  shape?: 'rectangle' | 'circle';
  text?: string;
}

const Whiteboard = ({ socket, roomId, userId }: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'text' | 'shape'>('pencil');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(2);
  const [shape, setShape] = useState<'rectangle' | 'circle'>('rectangle');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.strokeStyle = color;
      context.lineWidth = size;
      contextRef.current = context;
      saveState();
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('drawEvent', (event: DrawEvent) => {
      handleRemoteDrawEvent(event);
    });

    return () => {
      socket.off('drawEvent');
    };
  }, [socket]);

  const handleRemoteDrawEvent = (event: DrawEvent) => {
    if (!contextRef.current) return;

    const ctx = contextRef.current;
    
    switch (event.type) {
      case 'draw':
        ctx.strokeStyle = event.color || color;
        ctx.lineWidth = event.size || size;
        ctx.lineTo(event.x, event.y);
        ctx.stroke();
        break;
      case 'erase':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(event.x, event.y);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        break;
      case 'shape':
        drawShape(event.x, event.y, event.shape || 'rectangle');
        break;
      case 'text':
        if (event.text) {
          ctx.fillStyle = event.color || color;
          ctx.font = '16px Arial';
          ctx.fillText(event.text, event.x, event.y);
        }
        break;
    }
  };

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    if (!contextRef.current) return;

    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawing || !contextRef.current) return;

    const { offsetX, offsetY } = nativeEvent;
    const event: DrawEvent = {
      type: tool === 'pencil' ? 'draw' : tool === 'eraser' ? 'erase' : tool,
      x: offsetX,
      y: offsetY,
      color,
      size
    };

    if (tool === 'shape') {
      event.shape = shape;
    }

    socket.emit('drawEvent', { roomId, event });
    handleRemoteDrawEvent(event);
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
    saveState();
  };

  const drawShape = (x: number, y: number, shapeType: 'rectangle' | 'circle') => {
    if (!contextRef.current) return;

    const ctx = contextRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;

    if (shapeType === 'rectangle') {
      ctx.strokeRect(x - 25, y - 25, 50, 50);
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const addText = (e: React.MouseEvent) => {
    if (tool !== 'text' || !contextRef.current) return;

    const text = prompt('Enter text:');
    if (!text) return;

    const event: DrawEvent = {
      type: 'text',
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      color,
      text
    };

    socket.emit('drawEvent', { roomId, event });
    handleRemoteDrawEvent(event);
    saveState();
  };

  const saveState = () => {
    if (!canvasRef.current || !contextRef.current) return;

    const imageData = contextRef.current.getImageData(
      0, 
      0, 
      canvasRef.current.width, 
      canvasRef.current.height
    );

    setHistory(prev => [...prev.slice(0, historyIndex + 1), imageData]);
    setHistoryIndex(prev => prev + 1);
  };

  const undo = () => {
    if (historyIndex <= 0 || !contextRef.current || !canvasRef.current) return;

    setHistoryIndex(prev => prev - 1);
    contextRef.current.putImageData(history[historyIndex - 1], 0, 0);
    socket.emit('canvasState', { roomId, state: history[historyIndex - 1] });
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !contextRef.current) return;

    setHistoryIndex(prev => prev + 1);
    contextRef.current.putImageData(history[historyIndex + 1], 0, 0);
    socket.emit('canvasState', { roomId, state: history[historyIndex + 1] });
  };

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;

    contextRef.current.clearRect(
      0, 
      0, 
      canvasRef.current.width, 
      canvasRef.current.height
    );
    saveState();
    socket.emit('clearCanvas', { roomId });
  };

  return (
    <Card className="p-4">
      <div className="flex gap-2 mb-4">
        <Button
          variant={tool === 'pencil' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setTool('pencil')}
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          variant={tool === 'eraser' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setTool('eraser')}
        >
          <Eraser className="h-4 w-4" />
        </Button>

        <Button
          variant={tool === 'text' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setTool('text')}
        >
          <Type className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={tool === 'shape' ? 'default' : 'outline'}
              size="icon"
            >
              {shape === 'rectangle' ? (
                <Square className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => {
              setTool('shape');
              setShape('rectangle');
            }}>
              Rectangle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setTool('shape');
              setShape('circle');
            }}>
              Circle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-12"
        />

        <Input
          type="number"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          min="1"
          max="20"
          className="w-20"
        />

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={clearCanvas}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="border rounded-lg w-full h-[600px] cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onClick={tool === 'text' ? addText : undefined}
      />
    </Card>
  );
};

export default Whiteboard;