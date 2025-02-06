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

interface DrawPosition {
  x: number;
  y: number;
}

interface DrawEvent extends DrawPosition {
  type: 'draw' | 'erase' | 'text' | 'shape';
  prevPosition?: DrawPosition;
  color?: string;
  size?: number;
  shape?: 'rectangle' | 'circle';
  text?: string;
}

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPosition, setPrevPosition] = useState<DrawPosition | null>(null);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'text' | 'shape'>('pencil');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(2);
  const [shape, setShape] = useState<'rectangle' | 'circle'>('rectangle');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size to match display size
    canvas.width = rect.width;
    canvas.height = rect.height;

    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = color;
      context.lineWidth = size;
      contextRef.current = context;
      
      // Save initial blank state
      const initialState = context.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialState]);
      setHistoryIndex(0);
    }
  }, []);

  // Update context style when color or size changes
  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = size;
  }, [color, size]);

  const draw = (position: DrawPosition, prevPos?: DrawPosition) => {
    if (!contextRef.current) return;

    const ctx = contextRef.current;
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.beginPath();
    if (prevPos) {
      ctx.moveTo(prevPos.x, prevPos.y);
    } else {
      ctx.moveTo(position.x - 1, position.y - 1);
    }
    ctx.lineTo(position.x, position.y);
    ctx.stroke();
    ctx.closePath();
  };

  const drawShape = (position: DrawPosition) => {
    if (!contextRef.current) return;

    const ctx = contextRef.current;
    ctx.beginPath();
    
    if (shape === 'rectangle') {
      ctx.strokeRect(position.x - 25, position.y - 25, 50, 50);
    } else {
      ctx.arc(position.x, position.y, 25, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.closePath();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    setPrevPosition({ x: offsetX, y: offsetY });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setPrevPosition(null);
    saveToHistory();
  };

  const drawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const currentPosition = { x: offsetX, y: offsetY };

    if (tool === 'shape') {
      if (!contextRef.current || !canvasRef.current) return;
      
      // Clear canvas and redraw from last history state
      const lastState = history[historyIndex];
      if (lastState) {
        contextRef.current.putImageData(lastState, 0, 0);
      }
      
      drawShape(currentPosition);
    } else {
      draw(currentPosition, prevPosition || undefined);
    }

    setPrevPosition(currentPosition);
  };

  const addText = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'text' || !contextRef.current) return;

    const text = prompt('Enter text:');
    if (!text) return;

    const ctx = contextRef.current;
    const { offsetX, offsetY } = e.nativeEvent;
    
    ctx.fillStyle = color;
    ctx.font = '16px Arial';
    ctx.fillText(text, offsetX, offsetY);
    
    saveToHistory();
  };

  const saveToHistory = () => {
    if (!contextRef.current || !canvasRef.current) return;

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

    const newIndex = historyIndex - 1;
    contextRef.current.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !contextRef.current) return;

    const newIndex = historyIndex + 1;
    contextRef.current.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;

    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    saveToHistory();
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
        className="border rounded-lg w-full h-[600px] cursor-crosshair bg-white"
        onMouseDown={startDrawing}
        onMouseMove={drawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onClick={tool === 'text' ? addText : undefined}
      />
    </Card>
  );
};

export default Whiteboard;