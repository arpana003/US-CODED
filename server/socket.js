import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, true),
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
