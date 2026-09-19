require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { setSocketIO } = require('./services/notifications');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const sprintRoutes = require('./routes/sprintRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

// --- Core middleware ---
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// --- Routes ---
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'DevCollab AI API is running. See /api/health for status.' });
});

app.use(notFound);
app.use(errorHandler);

// --- Socket.IO (real-time chat + live notifications) ---
const io = new Server(server, {
  cors: { origin: allowedOrigin, credentials: true },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication token missing'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Invalid or expired authentication token'));
  }
});

io.on('connection', (socket) => {
  socket.join(`user:${socket.userId}`);

  socket.on('project:join', (projectId) => {
    if (projectId) socket.join(`project:${projectId}`);
  });

  socket.on('project:leave', (projectId) => {
    if (projectId) socket.leave(`project:${projectId}`);
  });

  socket.on('typing:start', ({ projectId }) => {
    if (projectId) socket.to(`project:${projectId}`).emit('typing:start', { userId: socket.userId, projectId });
  });

  socket.on('typing:stop', ({ projectId }) => {
    if (projectId) socket.to(`project:${projectId}`).emit('typing:stop', { userId: socket.userId, projectId });
  });
});

app.set('io', io);
setSocketIO(io);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[server] DevCollab AI backend listening on http://localhost:${PORT}`);
    console.log(`[server] Allowing requests from CLIENT_URL=${allowedOrigin}`);
    console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
  });
}

start();

process.on('unhandledRejection', (err) => {
  console.error('[server] Unhandled promise rejection:', err.message);
});

module.exports = { app, server };
