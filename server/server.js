const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./auth');
const db = require('./db');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const guardianRoutes = require('./routes/guardians');
const battleRoutes = require('./routes/battles');
const leaderboardRoutes = require('./routes/leaderboard');
const saveRoutes = require('./routes/save');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  'https://alinutzu.github.io',
  'http://localhost:3000',
  'http://localhost:5000',
];

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
      else cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/guardians', guardianRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/save', saveRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('auth', (data) => {
    try {
      const decoded = jwt.verify(data.token, JWT_SECRET);
      socket.userId = decoded.id;
      socket.username = decoded.username;
      onlineUsers.set(decoded.id, { username: decoded.username, socketId: socket.id });
      io.emit('online_count', onlineUsers.size);
      console.log(`${decoded.username} online`);
    } catch (err) {
      socket.emit('auth_error', { error: 'Invalid token' });
    }
  });

  socket.on('challenge', (data) => {
    if (!socket.userId) {
      return socket.emit('auth_error', { error: 'Not authenticated' });
    }
    const target = onlineUsers.get(data.targetUserId);
    if (target) {
      io.to(target.socketId).emit('challenge_received', {
        from: socket.userId,
        fromUsername: socket.username,
        guardianIds: data.guardianIds
      });
    }
  });

  socket.on('challenge_accept', (data) => {
    if (!socket.userId) {
      return socket.emit('auth_error', { error: 'Not authenticated' });
    }
    const challenger = onlineUsers.get(data.challengerId);
    if (challenger) {
      io.to(challenger.socketId).emit('battle_start', {
        opponent: socket.username,
        opponentId: socket.userId
      });
      socket.emit('battle_start', {
        opponent: challenger.username,
        opponentId: challenger.userId
      });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('online_count', onlineUsers.size);
      console.log(`${socket.username} offline`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Timebound server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
