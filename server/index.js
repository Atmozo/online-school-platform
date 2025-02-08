// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const authRoutes = require('./routes/auth');

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(bodyParser.json());

// // Routes
// app.use('/auth', authRoutes);

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quizRoutes');
const liveRoutes = require('./routes/liveRoutes');

// Room management
const rooms = new Map();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());

// Existing routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/auth', authRoutes);
app.use('/api', quizRoutes);
app.use('/live', liveRoutes);

// Room management functions
const getRoomParticipants = (roomId) => {
  return rooms.get(roomId) || new Map();
};

const addParticipantToRoom = (roomId, userId, userData) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }
  rooms.get(roomId).set(userId, userData);
};

const removeParticipantFromRoom = (roomId, userId) => {
  const room = rooms.get(roomId);
  if (room) {
    room.delete(userId);
    if (room.size === 0) {
      rooms.delete(roomId);
    }
    return true;
  }
  return false;
};

// Socket.IO handling
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  // Join room handling
  socket.on('joinRoom', async ({ roomId, userId, userName, role }) => {
    try {
      // Leave previous rooms if any
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
          removeParticipantFromRoom(room, socket.id);
        }
      });

      // Join new room
      socket.join(roomId);
      
      const userData = {
        userId,
        userName,
        role,
        isHost: role === 'instructor',
        joinedAt: new Date().toISOString()
      };
      
      addParticipantToRoom(roomId, socket.id, userData);
      
      // Get current participants
      const participants = Array.from(getRoomParticipants(roomId).entries())
        .map(([socketId, data]) => ({
          socketId,
          ...data
        }));

      // Notify everyone in the room
      io.to(roomId).emit('roomParticipants', participants);
      
      // Notify others about new participant
      socket.to(roomId).emit('participantJoined', {
        socketId: socket.id,
        ...userData
      });

    } catch (error) {
      console.error('Error in joinRoom:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // WebRTC Signaling
  socket.on('offer', ({ target, offer, roomId }) => {
    socket.to(target).emit('offer', {
      offer,
      from: socket.id,
      roomId
    });
  });

  socket.on('answer', ({ target, answer, roomId }) => {
    socket.to(target).emit('answer', {
      answer,
      from: socket.id,
      roomId
    });
  });

  socket.on('iceCandidate', ({ target, candidate, roomId }) => {
    socket.to(target).emit('iceCandidate', {
      candidate,
      from: socket.id,
      roomId
    });
  });

  // Chat functionality
  socket.on('chatMessage', ({ roomId, message, messageType = 'text' }) => {
    const participant = getRoomParticipants(roomId)?.get(socket.id);
    if (participant) {
      io.to(roomId).emit('chatMessage', {
        id: Date.now(),
        sender: {
          socketId: socket.id,
          userId: participant.userId,
          userName: participant.userName,
          role: participant.role
        },
        message,
        messageType,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Stream status updates
  socket.on('streamStatus', ({ roomId, status }) => {
    socket.to(roomId).emit('participantStreamStatus', {
      socketId: socket.id,
      status
    });
  });

  // Classroom control events (for instructors)
  socket.on('classroomControl', ({ roomId, action, targetId }) => {
    const participant = getRoomParticipants(roomId)?.get(socket.id);
    if (participant?.isHost) {
      switch (action) {
        case 'muteAll':
          io.to(roomId).emit('forceAudioState', { muted: true });
          break;
        case 'muteParticipant':
          io.to(targetId).emit('forceAudioState', { muted: true });
          break;
        case 'removeParticipant':
          io.to(targetId).emit('kicked');
          removeParticipantFromRoom(roomId, targetId);
          break;
      }
    }
  });
  // Hand raising
socket.on('raiseHand', ({ roomId, userId, userName }) => {
  io.to(roomId).emit('handRaised', { userId, userName });
});

socket.on('lowerHand', ({ roomId, userId }) => {
  io.to(roomId).emit('handLowered', { userId });
});

// Polling
socket.on('createPoll', ({ roomId, poll }) => {
  // Store poll in memory or database
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { polls: new Map() });
  }
  const roomData = rooms.get(roomId);
  roomData.polls = roomData.polls || new Map();
  roomData.polls.set(poll.id, poll);
  
  io.to(roomId).emit('pollCreated', poll);
});

socket.on('submitPollAnswer', ({ roomId, pollId, userId, answer }) => {
  const roomData = rooms.get(roomId);
  if (roomData?.polls?.has(pollId)) {
    const poll = roomData.polls.get(pollId);
    poll.results = poll.results || {};
    poll.results[answer] = (poll.results[answer] || 0) + 1;
    
    io.to(roomId).emit('pollResults', {
      pollId,
      results: poll.results
    });
  }
});

socket.on('endPoll', ({ roomId, pollId }) => {
  const roomData = rooms.get(roomId);
  if (roomData?.polls?.has(pollId)) {
    const poll = roomData.polls.get(pollId);
    poll.status = 'ended';
    io.to(roomId).emit('pollEnded', { pollId });
  }
});

// Q&A
socket.on('askQuestion', ({ roomId, question }) => {
  // Store question in memory or database
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { questions: [] });
  }
  const roomData = rooms.get(roomId);
  roomData.questions = roomData.questions || [];
  roomData.questions.push(question);
  
  io.to(roomId).emit('questionAsked', question);
});

socket.on('markQuestionAnswered', ({ roomId, questionId }) => {
  const roomData = rooms.get(roomId);
  if (roomData?.questions) {
    const question = roomData.questions.find(q => q.id === questionId);
    if (question) {
      question.answered = true;
      io.to(roomId).emit('questionAnswered', { questionId });
    }
  }
});

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Find all rooms this socket was in and clean up
    rooms.forEach((participants, roomId) => {
      if (participants.has(socket.id)) {
        const userData = participants.get(socket.id);
        removeParticipantFromRoom(roomId, socket.id);
        
        // If user was host, assign new host if possible
        if (userData.isHost) {
          const remainingParticipants = getRoomParticipants(roomId);
          const newHost = Array.from(remainingParticipants.entries())[0];
          if (newHost) {
            const [newHostId, newHostData] = newHost;
            newHostData.isHost = true;
            io.to(roomId).emit('hostChanged', { newHostId });
          }
        }
        
        // Notify room about participant leaving
        io.to(roomId).emit('participantLeft', {
          socketId: socket.id,
          userId: userData.userId
        });
      }
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//Start server

const PORT = process.env.PORT ||5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
