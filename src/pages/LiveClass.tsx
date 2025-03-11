import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, MessageSquare, Users, X, Send, Camera, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import EngagementFeatures from './EngagementFeatures';
import Whiteboard from './Whiteboard';
import ScreenSharing from './ScreenSharing';

interface Participant {
  socketId: string;
  userId: string;
  userName: string;
  role: string;
  isHost: boolean;
}

interface ChatMessage {
  id: number;
  sender: {
    userName: string;
    role: string;
  };
  message: string;
  timestamp: string;
}

interface SignalingPayload {
  from: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

const LiveClass = () => {
  // State management
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>(Math.random().toString(36).substring(7));
  const [userName, setUserName] = useState<string>('');
  const [role, setRole] = useState<'instructor' | 'student'>('student');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [activeScreenShares, setActiveScreenShares] = useState<Map<string, MediaStream>>(new Map());
  const [remoteCameras, setRemoteCameras] = useState<Map<string, MediaStream>>(new Map());
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteScreenRef = useRef<HTMLVideoElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initialize socket when component mounts
  useEffect(() => {
    if (isJoined) {
      const newSocket = io('https://online-school-platform.onrender.com');
      setSocket(newSocket);
  
      return () => {
        newSocket.close();
      };
    }
  }, [isJoined]);

  // Function to initialize media stream with fallbacks
  const initializeMediaStream = async (videoEnabled = true) => {
    try {
      // Try to get both audio and video
      const constraints = {
        audio: true,
        video: videoEnabled ? { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } : false
      };
      
      console.log("Requesting media with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log("Media stream obtained successfully:", stream.getTracks().map(t => t.kind).join(', '));
      setLocalStream(stream);
      setMediaError(null);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        
        // Force the video element to play
        localVideoRef.current.onloadedmetadata = () => {
          if (localVideoRef.current) {
            localVideoRef.current.play().catch(e => {
              console.error("Error playing local video:", e);
              setMediaError("Error playing video. Please refresh and try again.");
            });
          }
        };
      }
      
      // Update existing peer connections with the new stream
      peerConnections.current.forEach((pc) => {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      });
      
      return true;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      // If we failed with video, try audio only
      if (videoEnabled) {
        console.log("Failed to get video, trying audio only");
        setIsVideoEnabled(false);
        const success = await initializeMediaStream(false);
        
        if (success) {
          setMediaError("Camera not available. Using audio only.");
          return true;
        }
      }
      
      setMediaError(
        error instanceof DOMException 
          ? `Media error: ${error.name}. ${error.message}`
          : "Could not access camera/microphone. Please check permissions."
      );
      
      // Create an empty stream to allow joining without media
      if (!localStream) {
        const emptyStream = new MediaStream();
        setLocalStream(emptyStream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = emptyStream;
        }
      }
      
      return false;
    }
  };

  // Initialize media stream after joining
  useEffect(() => {
    if (isJoined && !localStream) {
      initializeMediaStream();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isJoined, localStream]);

  // Retry media access when retry count changes
  useEffect(() => {
    if (retryCount > 0 && isJoined) {
      console.log(`Retrying media Access, attempt ${retryCount}`);
      initializeMediaStream();
    }
  }, [retryCount]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isJoined) return;

    socket.emit('joinRoom', { roomId, userId, userName, role });

    socket.on('roomParticipants', (newParticipants: Participant[]) => {
      console.log("Received room participants:", newParticipants);
      setParticipants(newParticipants);
      
      // Initialize peer connections with new participants
      newParticipants.forEach(participant => {
        if (participant.socketId !== socket.id && !peerConnections.current.has(participant.socketId)) {
          console.log(`Creating connection with ${participant.userName} (${participant.socketId})`);
          createPeerConnection(participant.socketId);
          
          // After creating peer connection, initiate the offer
          if (localStream) {
            const pc = peerConnections.current.get(participant.socketId);
            if (pc) {
              pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                  socket.emit('offer', {
                    target: participant.socketId,
                    offer: pc.localDescription,
                    roomId
                  });
                })
                .catch(err => console.error('Error creating offer:', err));
            }
          }
        }
      });
    });

    socket.on('chatMessage', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    });

    // WebRTC signaling handlers
    socket.on('offer', async ({ from, offer }: SignalingPayload) => {
      if (!offer) return;
      
      console.log(`Received offer from ${from}`);
      let pc = peerConnections.current.get(from);
      
      if (!pc) {
        pc = createPeerConnection(from);
      }
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: from, answer, roomId });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    socket.on('answer', async ({ from, answer }: SignalingPayload) => {
      if (!answer) return;
      
      console.log(`Received answer from ${from}`);
      const pc = peerConnections.current.get(from);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error setting remote description:', err);
        }
      }
    });

    socket.on('iceCandidate', async ({ from, candidate }: SignalingPayload) => {
      if (!candidate) return;
      
      console.log(`Received ICE candidate from ${from}`);
      const pc = peerConnections.current.get(from);
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });

    socket.on('streamStatus', ({ userId, status }) => {
      console.log(`User ${userId} stream status changed:`, status);
      // Handle remote stream status changes if needed
    });

    // Handle screen sharing notification
    socket.on('screenTrackAdded', ({ userId: sharingUserId }) => {
      console.log(`Received screen track notification from ${sharingUserId}`);
    });

    return () => {
      socket.off('roomParticipants');
      socket.off('chatMessage');
      socket.off('offer');
      socket.off('answer');
      socket.off('iceCandidate');
      socket.off('screenTrackAdded');
      socket.off('streamStatus');
    };
  }, [socket, roomId, userId, userName, role, isJoined, localStream]);

  // Create and manage peer connections
  const createPeerConnection = (targetId: string) => {
    console.log(`Creating peer connection with ${targetId}`);
    
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        console.log(`Sending ICE candidate to ${targetId}`, event.candidate);
        socket.emit('iceCandidate', {
          target: targetId,
          candidate: event.candidate,
          roomId
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${targetId}: ${pc.iceConnectionState}`);
      
      // Handle connection state changes
      if (pc.iceConnectionState === 'disconnected' || 
          pc.iceConnectionState === 'failed' || 
          pc.iceConnectionState === 'closed') {
        
        console.log(`Connection with ${targetId} is ${pc.iceConnectionState}`);
        
        // Remove from remote cameras if disconnected
        if (remoteCameras.has(targetId)) {
          setRemoteCameras(prev => {
            const newMap = new Map(prev);
            newMap.delete(targetId);
            return newMap;
          });
        }
      }
    };

    pc.ontrack = (event) => {
      console.log(`Received track from ${targetId}`, event.streams[0]);
      const participant = participants.find(p => p.socketId === targetId);
      
      if (participant && event.streams && event.streams[0]) {
        const stream = event.streams[0];
        
        // Debug track info
        const trackInfo = event.streams[0].getTracks().map(t => 
          `${t.kind}: enabled=${t.enabled}, muted=${t.muted}, readyState=${t.readyState}`
        );
        console.log(`Track details for ${participant.userName}:`, trackInfo);
        
        // Check if this is a screen share track
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const trackSettings = videoTrack.getSettings();
          
          // If this is likely a screen share track
          if (trackSettings.displaySurface || 
              (trackSettings.width && trackSettings.width > 1000) || 
              stream.id.includes('screen')) {
            
            console.log('Detected screen share track:', stream.id);
            
            // Update the shared screen video element
            const sharedScreenVideo = document.getElementById('shared-screen-video') as HTMLVideoElement;
            if (sharedScreenVideo) {
              sharedScreenVideo.srcObject = stream;
              sharedScreenVideo.play().catch(e => console.error("Error playing shared screen:", e));
            }
            
            // Store the screen share stream
            setActiveScreenShares(prev => {
              const newMap = new Map(prev);
              newMap.set(participant.userId, stream);
              return newMap;
            });
          } else {
            // This is a regular camera video track
            console.log('Detected camera track:', stream.id);
            
            // Store the remote camera stream in state
            setRemoteCameras(prev => {
              const newMap = new Map(prev);
              newMap.set(participant.socketId, stream);
              return newMap;
            });

            // Update video element
            const videoElement = document.getElementById(`video-${targetId}`) as HTMLVideoElement;
            if (videoElement) {
              videoElement.srcObject = stream;
              
              // Force the video to play
              videoElement.onloadedmetadata = () => {
                if (videoElement) {
                  videoElement.play().catch(e => 
                    console.error(`Error playing remote video for ${targetId}:`, e)
                  );
                }
              };
            }
          }
        } else if (stream.getAudioTracks().length > 0) {
          // If it's an audio-only stream, still update remote cameras to show the participant
          console.log(`Received audio-only stream from ${participant.userName}`);
          
          setRemoteCameras(prev => {
            const newMap = new Map(prev);
            newMap.set(participant.socketId, stream);
            return newMap;
          });
          
          const videoElement = document.getElementById(`video-${targetId}`) as HTMLVideoElement;
          if (videoElement) {
            videoElement.srcObject = stream;
          }
        }
      }
    };

    // Handle negotiation needed event (important for screen sharing)
    pc.onnegotiationneeded = async () => {
      try {
        console.log(`Negotiation needed with ${targetId}`);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        if (socket) {
          socket.emit('offer', {
            target: targetId,
            offer,
            roomId
          });
        }
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    };

    // Add local tracks to the peer connection
    if (localStream) {
      console.log(`Adding local tracks to peer connection with ${targetId}`);
      const tracks = localStream.getTracks();
      if (tracks.length > 0) {
        tracks.forEach(track => {
          try {
            pc.addTrack(track, localStream);
          } catch (err) {
            console.error(`Error adding ${track.kind} track to connection:`, err);
          }
        });
      } else {
        console.warn("Local stream has no tracks to add");
      }
    } else {
      console.warn("No local stream available when creating peer connection");
    }

    peerConnections.current.set(targetId, pc);
    return pc;
  };

  // Media control handlers
  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const audioTrack = audioTracks[0];
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        socket?.emit('streamStatus', { roomId, status: { audio: audioTrack.enabled } });
      } else {
        // Try to get audio if not available
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
              localStream.addTrack(audioTrack);
              setIsAudioEnabled(true);
              
              // Update peer connections with new track
              peerConnections.current.forEach(pc => {
                pc.addTrack(audioTrack, localStream);
              });
              
              socket?.emit('streamStatus', { roomId, status: { audio: true } });
            }
          })
          .catch(err => {
            console.error("Could not add audio track:", err);
            setMediaError("Could not enable microphone. Please check permissions.");
          });
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      
      if (videoTracks.length > 0) {
        // If we have video tracks, toggle them
        const videoTrack = videoTracks[0];
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        socket?.emit('streamStatus', { roomId, status: { video: videoTrack.enabled } });
      } else if (isVideoEnabled) {
        // We're trying to disable a non-existent video
        setIsVideoEnabled(false);
      } else {
        // Try to get video if not already available
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
              localStream.addTrack(videoTrack);
              setIsVideoEnabled(true);
              
              // Update video element
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
              }
              
              // Update peer connections with new track
              peerConnections.current.forEach(pc => {
                pc.addTrack(videoTrack, localStream);
              });
              
              socket?.emit('streamStatus', { roomId, status: { video: true } });
            }
          })
          .catch(err => {
            console.error("Could not add video track:", err);
            setMediaError("Could not enable camera. Please check permissions.");
          });
      }
    }
  };

  // Handle retry for media
  const handleRetryMedia = () => {
    setRetryCount(prev => prev + 1);
    setMediaError(null);
  };

  // Chat handlers
  const sendMessage = () => {
    if (messageInput.trim() && socket) {
      socket.emit('chatMessage', { roomId, message: messageInput });
      setMessageInput('');
    }
  };

  // Join room handler
  const handleJoinRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!roomId) {
      alert('Please select a room');
      return;
    }
    setIsJoined(true);
  };

  // If not joined, show login screen
  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Join Live Class</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <Input 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Select Role</label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={role === 'student' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setRole('student')}
                >
                  Student
                </Button>
                <Button
                  type="button"
                  variant={role === 'instructor' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setRole('instructor')}
                >
                  Instructor
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Select Room</label>
              <select
                className="w-full p-2 border rounded-md"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
              >
                <option value="" disabled>Select a room</option>
                <option value="manual-testing">Manual Testing</option>
                <option value="automation-testing">Automation Testing</option>
                <option value="java-basics">Java Basics</option>
                <option value="js-basics">JS Basics</option>
                <option value="python-basics">Python Basics</option>
              </select>
            </div>
            
            <Button 
              className="w-full mt-6" 
              onClick={handleJoinRoom}
            >
              Join Class
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main component UI
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
      
        {/* Media error alert */}
        {mediaError && (
          <div className="m-4 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500" />
              <p className="text-amber-800">{mediaError}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRetryMedia}>
              Retry Camera
            </Button>
          </div>
        )}
      
        {/* Video grid */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Engagement features */}
          <EngagementFeatures
            socket={socket}
            roomId={roomId}
            userId={userId} 
            userName={userName}
            isInstructor={role === 'instructor'}
          />
          
          {/* Local video */}
          <Card className="relative overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover rounded-lg ${!isVideoEnabled || !localStream?.getVideoTracks().length ? 'hidden' : ''}`}
            />
            
            {/* Placeholder when video is not available */}
            {(!localStream?.getVideoTracks().length || !isVideoEnabled) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200">
                <Camera className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600">
                  {!localStream?.getVideoTracks().length 
                    ? "Camera not available" 
                    : "Video turned off"}
                </p>
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded">
              You ({role}) {!isVideoEnabled && "(Video Off)"}
            </div>
          </Card>
          
          {/* Remote videos */}
          {participants
            .filter(p => p.socketId !== socket?.id)
            .map(participant => (
              <Card key={participant.socketId} className="relative overflow-hidden">
                <video
                  id={`video-${participant.socketId}`}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover rounded-lg ${remoteCameras.has(participant.socketId) && remoteCameras.get(participant.socketId)?.getVideoTracks().length && remoteCameras.get(participant.socketId)?.getVideoTracks()[0].enabled ? '' : 'hidden'}`}
                />
                
                {/* Placeholder when remote video is not available */}
                {(!remoteCameras.has(participant.socketId) || 
                  !remoteCameras.get(participant.socketId)?.getVideoTracks().length || 
                  !remoteCameras.get(participant.socketId)?.getVideoTracks()[0].enabled) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200">
                    <Camera className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-600">
                      {!remoteCameras.has(participant.socketId) 
                        ? "Waiting for video..." 
                        : "Video off"}
                    </p>
                  </div>
                )}
                
                <div className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded">
                  {participant.userName} ({participant.role})
                </div>
              </Card>
            ))}
        </div>

        {/* Screen Sharing component */}
        <ScreenSharing 
          socket={socket} 
          roomId={roomId} 
          userId={userId} 
          isInstructor={role === 'instructor'} 
          peerConnections={peerConnections.current}
        />

        {/* Additional components */}
        <Whiteboard 
          socket={socket} 
          roomId={roomId} 
          userId={userId} 
          isInstructor={role === 'instructor'} 
        />

        {/* Control bar */}
        <div className="bg-white p-4 flex items-center justify-center space-x-4">
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="icon"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic /> : <MicOff />}
          </Button>
          
          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="icon"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video /> : <VideoOff />}
          </Button>

          <Button
            variant={isChatOpen ? "secondary" : "outline"}
            size="icon"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageSquare />
          </Button>

          <Button
            variant={isParticipantListOpen ? "secondary" : "outline"}
            size="icon"
            onClick={() => setIsParticipantListOpen(!isParticipantListOpen)}
          >
            <Users />
          </Button>
        </div>
      </div>

      {/* Chat sidebar */}
      {isChatOpen && (
        <Card className="w-80 flex flex-col border-l">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Chat</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
            {chatMessages.map(msg => (
              <div key={msg.id} className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{msg.sender.userName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-700">{msg.message}</p>
              </div>
            ))}
          </ScrollArea>

          <div className="p-4 border-t flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Participants sidebar */}
      {isParticipantListOpen && (
        <Card className="w-80 flex flex-col border-l">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Participants ({participants.length})</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsParticipantListOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            {participants.map(participant => (
              <div
                key={participant.socketId}
                className="p-4 border-b last:border-b-0 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{participant.userName}</div>
                  <div className="text-sm text-gray-500">{participant.role}</div>
                </div>
                {participant.isHost && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Host
                  </span>
                )}
              </div>
            ))}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

export default LiveClass;
