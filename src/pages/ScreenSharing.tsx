import { useState, useEffect, useRef } from 'react';
import { Monitor, StopCircle, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ScreenSharingProps {
  socket: any;
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
  const [remoteScreenUserId, setRemoteScreenUserId] = useState<string | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!socket) return;

    // Handle when another user starts sharing their screen
    socket.on('userStartedSharing', ({ userId: sharingUserId }) => {
      console.log(`User ${sharingUserId} started sharing screen`);
      setRemoteScreenUserId(sharingUserId);
    });

    // Handle when a user stops sharing their screen
    socket.on('userStoppedSharing', ({ userId: sharingUserId }) => {
      console.log(`User ${sharingUserId} stopped sharing screen`);
      if (remoteScreenUserId === sharingUserId) {
        setRemoteScreenUserId(null);
      }
      if (screenVideoRef.current && !isSharing) {
        screenVideoRef.current.srcObject = null;
      }
    });

    // Handle new incoming screen sharing tracks
    socket.on('screenTrackAdded', ({ userId: sharingUserId }) => {
      console.log(`Received screen track notification from ${sharingUserId}`);
    });

    return () => {
      socket.off('userStartedSharing');
      socket.off('userStoppedSharing');
      socket.off('screenTrackAdded');
      stopSharing();
    };
  }, [socket, remoteScreenUserId, isSharing]);

  const startSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      setScreenStream(stream);
      setIsSharing(true);

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      // Add screen share track to all peer connections with a specific stream ID prefix
      peerConnections.forEach((pc, peerId) => {
        stream.getTracks().forEach(track => {
          // Mark this track as a screen share
          pc.addTrack(track, stream);
          
          // Notify peers that we've added a screen track
          socket.emit('screenTrackAdded', { 
            roomId, 
            userId,
            targetId: peerId 
          });
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

  // Determine if we should show the video element
  const shouldShowVideo = isSharing || remoteScreenUserId !== null;

  return (
    <div className="relative mt-4">
      {isInstructor && (
        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
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

      {shouldShowVideo && (
        <Card className="relative mt-4">
          <video
            ref={screenVideoRef}
            id="shared-screen-video"
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          {remoteScreenUserId && !isSharing && (
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              Screen shared by user: {remoteScreenUserId}
            </div>
          )}
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
