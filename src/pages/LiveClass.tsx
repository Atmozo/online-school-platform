import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, MessageSquare, Users, X, Send } from 'lucide-react';
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

  // Initialize media stream after joining
  useEffect(() => {
    if (isJoined && !localStream) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((error) => console.error('Error accessing media devices:', error));
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isJoined, localStream]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isJoined) return;

    socket.emit('joinRoom', { roomId, userId, userName, role });

    socket.on('roomParticipants', (newParticipants: Participant[]) => {
      setParticipants(newParticipants);
      // Initialize peer connections with new participants
      newParticipants.forEach(participant => {
        if (participant.socketId !== socket.id && !peerConnections.current.has(participant.socketId)) {
          createPeerConnection(participant.socketId);
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
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { target: from, answer, roomId });
    });

    socket.on('answer', async ({ from, answer }: SignalingPayload) => {
      if (!answer) return;
      const pc = peerConnections.current.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('iceCandidate', async ({ from, candidate }: SignalingPayload) => {
      if (!candidate) return;
      const pc = peerConnections.current.get(from);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
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
    };
  }, [socket, roomId, userId, userName, role, isJoined]);

  // Create and manage peer connections
  const createPeerConnection = (targetId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('iceCandidate', {
          target: targetId,
          candidate: event.candidate,
          roomId
        });
      }
    };

    pc.ontrack = (event) => {
      const participant = participants.find(p => p.socketId === targetId);
      
      if (participant) {
        // Check if this is a screen share track
        // Screen share tracks typically have displaySurface in the settings
        const videoTrack = event.streams[0].getVideoTracks()[0];
        if (videoTrack) {
          const trackSettings = videoTrack.getSettings();
          
          // If this is likely a screen share track (based on settings or stream ID)
          if (trackSettings.displaySurface || 
              (trackSettings.width && trackSettings.width > 1000) || 
              event.streams[0].id.includes('screen')) {
            
            console.log('Detected screen share track:', event.streams[0].id);
            
            // Update the shared screen video element
            const sharedScreenVideo = document.getElementById('shared-screen-video') as HTMLVideoElement;
            if (sharedScreenVideo) {
              sharedScreenVideo.srcObject = event.streams[0];
            }
            
            // Store the screen share stream
            setActiveScreenShares(prev => {
              const newMap = new Map(prev);
              newMap.set(participant.userId, event.streams[0]);
              return newMap;
            });
          } else {
            // This is a regular camera video track
            const videoElement = document.getElementById(`video-${targetId}`) as HTMLVideoElement;
            if (videoElement) {
              videoElement.srcObject = event.streams[0];
            }
          }
        } else {
          // If no video track, assume it's a regular stream
          const videoElement = document.getElementById(`video-${targetId}`) as HTMLVideoElement;
          if (videoElement) {
            videoElement.srcObject = event.streams[0];
          }
        }
      }
    };

    // Handle negotiation needed event (important for screen sharing)
    pc.onnegotiationneeded = async () => {
      try {
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

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnections.current.set(targetId, pc);
    return pc;
  };

  // Media control handlers
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
      socket?.emit('streamStatus', { roomId, status: { audio: audioTrack.enabled } });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
      socket?.emit('streamStatus', { roomId, status: { video: videoTrack.enabled } });
    }
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
          <Card className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
            
            <div className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded">
              You ({role})
            </div>
          </Card>
          
          {/* Remote videos */}
          {participants
            .filter(p => p.socketId !== socket?.id)
            .map(participant => (
              <Card key={participant.socketId} className="relative">
                <video
                  id={`video-${participant.socketId}`}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded-lg"
                />
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
