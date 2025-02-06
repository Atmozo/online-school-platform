import { useState, useEffect, useRef } from 'react';
import { Monitor, StopCircle, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Socket } from 'socket.io-client';

interface ScreenSharingProps {
  socket: Socket;
  roomId: string;
  userId: string;
  isInstructor: boolean;
  peerConnections: Map<string, RTCPeerConnection>;
}

const ScreenSharing = ({
  socket,
  roomId,
  userId,
  isInstructor,
  peerConnections
}: ScreenSharingProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('userStartedSharing', ({ userId: sharingUserId }: { userId: string }) => {
      console.log(`User ${sharingUserId} started sharing screen`);
    });

    socket.on('userStoppedSharing', ({ userId: sharingUserId }: { userId: string }) => {
      console.log(`User ${sharingUserId} stopped sharing screen`);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
    });

    return () => {
      socket.off('userStartedSharing');
      socket.off('userStoppedSharing');
      stopSharing();
    };
  }, [socket]);

  const startSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
        },
        audio: true
      });

      setScreenStream(stream);
      setIsSharing(true);

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      // Add screen share track to all peer connections
      peerConnections.forEach((pc) => {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      });

      // Notify other participants
      socket.emit('startScreenShare', { roomId, userId });

      // Handle stream stop
      stream.getVideoTracks()[0].onended = () => {
        stopSharing();
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const stopSharing = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsSharing(false);
      socket.emit('stopScreenShare', { roomId, userId });
    }
  };

  const toggleFullscreen = () => {
    if (!screenVideoRef.current) return;

    if (!document.fullscreenElement) {
      screenVideoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative">
      {isInstructor && (
        <div className="absolute bottom-175 right-4 z-10 flex gap-2">
          <Button
            variant={isSharing ? "destructive" : "default"}
            size="sm"
            onClick={isSharing ? stopSharing : startSharing}
          >
            {isSharing ? (
              <>
                <StopCircle className="h-4 w-4 mr-2" />
                Stop Sharing
              </>
            ) : (
              <>
                <Monitor className="h-4 w-4 mr-2" />
                Share Screen
              </>
            )}
          </Button>
        </div>
      )}

      {(isSharing || screenVideoRef.current?.srcObject) && (
        <Card className="relative">
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-4 right-4"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ScreenSharing;