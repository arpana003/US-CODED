import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer, clientUrl) => {
  const allowedOrigins = (clientUrl || 'http://localhost:5173')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origin not allowed by Socket.IO CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn('[Socket.io] io instance not initialized yet');
  }
  return io;
};

export const emitSocketEvent = (eventName, data) => {
  if (io) {
    io.emit(eventName, {
      event: eventName,
      data,
      timestamp: new Date().toISOString()
    });
  }
};
