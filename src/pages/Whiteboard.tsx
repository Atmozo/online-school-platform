import { useState, useEffect, useRef } from 'react';
import { 
  Pencil, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Undo, 
  Redo,
  Trash2,
  Lock,
  Hand
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
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  roomId: string;
  userId: string;
}

interface WhiteboardProps {
  socket: any; 
  roomId: string;
  userId: string;
  isInstructor: boolean;
}

interface WhiteboardAccessRequest {
  userId: string;
  userName: string;
  pending: boolean;
}

const Whiteboard = ({ socket, roomId, userId, isInstructor }: WhiteboardProps) => {
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
  const [hasAccess, setHasAccess] = useState(isInstructor);
  const [requestedAccess, setRequestedAccess] = useState(false);
  const [accessRequests, setAccessRequests] = useState<WhiteboardAccessRequest[]>([]);

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

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Listen for whiteboard events from other users
    socket.on('whiteboardDraw', (drawEvent: DrawEvent) => {
      if (!contextRef.current || !canvasRef.current) return;
      
      // Don't process events from self
      if (drawEvent.userId === userId) return;
      
      // Set up context based on received event
      contextRef.current.strokeStyle = drawEvent.color || color;
      contextRef.current.lineWidth = drawEvent.size || size;
      
      if (drawEvent.type === 'draw' || drawEvent.type === 'erase') {
        // Set composite operation based on tool
        contextRef.current.globalCompositeOperation = 
          drawEvent.type === 'erase' ? 'destination-out' : 'source-over';
        
        // Draw using the received coordinates
        const position = { x: drawEvent.x, y: drawEvent.y };
        const prevPos = drawEvent.prevPosition;
        
        // Use helper function that doesn't emit events
        drawFromEvent(position, prevPos);
      } else if (drawEvent.type === 'shape') {
        // Set composite operation to source-over for shapes
        contextRef.current.globalCompositeOperation = 'source-over';
        
        // Draw shape using received coordinates
        drawShapeFromEvent({ x: drawEvent.x, y: drawEvent.y }, drawEvent.shape as 'rectangle' | 'circle');
      } else if (drawEvent.type === 'text' && drawEvent.text) {
        // Draw text
        contextRef.current.globalCompositeOperation = 'source-over';
        contextRef.current.fillStyle = drawEvent.color || color;
        contextRef.current.font = '16px Arial';
        contextRef.current.fillText(drawEvent.text, drawEvent.x, drawEvent.y);
      }
      
      // Save to history after receiving external drawing
      saveToHistory();
    });
    
    socket.on('whiteboardClear', () => {
      if (!contextRef.current || !canvasRef.current) return;
      // Clear canvas without emitting event
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveToHistory();
    });

    // Handle whiteboard access requests and responses
    socket.on('whiteboardAccessRequest', (request) => {
      if (isInstructor) {
        setAccessRequests(prev => [...prev, { 
          userId: request.userId, 
          userName: request.userName, 
          pending: true 
        }]);
      }
    });

    socket.on('whiteboardAccessResponse', (response) => {
      if (response.userId === userId) {
        setHasAccess(response.granted);
        setRequestedAccess(false);
      }
    });

    socket.on('whiteboardAccessRevoked', (data) => {
      if (data.userId === userId) {
        setHasAccess(false);
      }
    });
    
    return () => {
      socket.off('whiteboardDraw');
      socket.off('whiteboardClear');
      socket.off('whiteboardAccessRequest');
      socket.off('whiteboardAccessResponse');
      socket.off('whiteboardAccessRevoked');
    };
  }, [socket, userId, color, size, isInstructor]);

  // Update context style when color or size changes
  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = size;
  }, [color, size]);

  // Helper function to draw from received events without emitting
  const drawFromEvent = (position: DrawPosition, prevPos?: DrawPosition) => {
    if (!contextRef.current) return;

    const ctx = contextRef.current;
    
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

  // Helper function to draw shapes from received events without emitting
  const drawShapeFromEvent = (position: DrawPosition, shapeType: 'rectangle' | 'circle') => {
    if (!contextRef.current) return;

    const ctx = contextRef.current;
    ctx.beginPath();
    
    if (shapeType === 'rectangle') {
      ctx.strokeRect(position.x - 25, position.y - 25, 50, 50);
    } else {
      ctx.arc(position.x, position.y, 25, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.closePath();
  };

  // Main drawing function that emits events
  const draw = (position: DrawPosition, prevPos?: DrawPosition) => {
    if (!contextRef.current || !hasAccess) return;

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
    
    // Emit the draw event to other clients
    if (socket && roomId) {
      socket.emit('whiteboardDraw', {
        roomId,
        userId,
        type: tool === 'eraser' ? 'erase' : 'draw',
        x: position.x,
        y: position.y,
        prevPosition: prevPos,
        color: color,
        size: size
      });
    }
  };

  // Shape drawing function that emits events
  const drawShape = (position: DrawPosition) => {
    if (!contextRef.current || !hasAccess) return;

    const ctx = contextRef.current;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    
    if (shape === 'rectangle') {
      ctx.strokeRect(position.x - 25, position.y - 25, 50, 50);
    } else {
      ctx.arc(position.x, position.y, 25, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.closePath();
    
    // Emit the shape draw event
    if (socket && roomId) {
      socket.emit('whiteboardDraw', {
        roomId,
        userId,
        type: 'shape',
        x: position.x,
        y: position.y,
        shape: shape,
        color: color,
        size: size
      });
    }
  };

  // Clear canvas function that emits events
  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current || !hasAccess) return;

    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    saveToHistory();
    
    // Emit the clear event
    if (socket && roomId) {
      socket.emit('whiteboardClear', { roomId });
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hasAccess) return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    setPrevPosition({ x: offsetX, y: offsetY });
  };

  const stopDrawing = () => {
    if (!hasAccess) return;
    
    setIsDrawing(false);
    setPrevPosition(null);
    saveToHistory();
  };

  const drawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !hasAccess) return;

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
    if (tool !== 'text' || !contextRef.current || !hasAccess) return;

    const text = prompt('Enter text:');
    if (!text) return;

    const ctx = contextRef.current;
    const { offsetX, offsetY } = e.nativeEvent;
    
    ctx.fillStyle = color;
    ctx.font = '16px Arial';
    ctx.fillText(text, offsetX, offsetY);
    
    // Emit text event
    if (socket && roomId) {
      socket.emit('whiteboardDraw', {
        roomId,
        userId,
        type: 'text',
        x: offsetX,
        y: offsetY,
        text: text,
        color: color,
        size: size
      });
    }
    
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
    if (historyIndex <= 0 || !contextRef.current || !canvasRef.current || !hasAccess) return;

    const newIndex = historyIndex - 1;
    contextRef.current.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !contextRef.current || !hasAccess) return;

    const newIndex = historyIndex + 1;
    contextRef.current.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  // Handle request for whiteboard access
  const requestAccess = () => {
    if (socket && roomId && !hasAccess && !requestedAccess) {
      socket.emit('whiteboardAccessRequest', { 
        roomId, 
        userId,
        userName: 'Student' // Ideally this would be the actual user's name from props
      });
      setRequestedAccess(true);
    }
  };

  // Handle response to access requests (for instructors)
  const respondToAccessRequest = (requestUserId: string, granted: boolean) => {
    if (socket && roomId && isInstructor) {
      socket.emit('whiteboardAccessResponse', { 
        roomId, 
        userId: requestUserId, 
        granted 
      });
      
      setAccessRequests(prev => 
        prev.map(req => 
          req.userId === requestUserId ? { ...req, pending: false } : req
        ).filter(req => req.userId !== requestUserId || !granted)
      );
    }
  };

  // Revoke access from a student
  const revokeAccess = (studentUserId: string) => {
    if (socket && roomId && isInstructor) {
      socket.emit('whiteboardAccessRevoked', { 
        roomId, 
        userId: studentUserId 
      });
    }
  };

  return (
    <Card className="p-4 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Whiteboard</h3>
        
        {/* Student request access button */}
        {!isInstructor && !hasAccess && (
          <Button
            variant="outline"
            size="sm"
            onClick={requestAccess}
            disabled={requestedAccess}
            className="flex items-center gap-2"
          >
            {requestedAccess ? (
              <>
                <Hand className="h-4 w-4" />
                Access Requested
              </>
            ) : (
              <>
                <Hand className="h-4 w-4" />
                Request Whiteboard Access
              </>
            )}
          </Button>
        )}
        
        {/* Access request list for instructors */}
        {isInstructor && accessRequests.length > 0 && (
          <div className="flex flex-col gap-2">
            {accessRequests.filter(req => req.pending).map(request => (
              <Alert key={request.userId} className="mb-2 p-2 flex justify-between items-center">
                <AlertDescription className="text-sm">
                  {request.userName} requests whiteboard access
                </AlertDescription>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => respondToAccessRequest(request.userId, true)}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => respondToAccessRequest(request.userId, false)}
                  >
                    Deny
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </div>
      
      {/* Display access state */}
      {!hasAccess && (
        <div className="flex items-center justify-center p-2 mb-4 bg-gray-100 rounded-md">
          <Lock className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-gray-500">
            {requestedAccess 
              ? "Waiting for instructor approval..." 
              : "Whiteboard is locked. Only the instructor can edit."}
          </span>
        </div>
      )}

      {/* Toolbar - only visible if user has access */}
      {hasAccess && (
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
      )}

      <canvas
        ref={canvasRef}
        className={`border rounded-lg w-full h-[600px] ${hasAccess ? 'cursor-crosshair' : 'cursor-not-allowed'} bg-white`}
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
