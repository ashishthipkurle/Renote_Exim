import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// When running a custom server, Next.js handles routing completely
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected via WebSocket:', socket.id);

    // Join a room representing the user's ID to receive private events
    socket.on("join-user-room", (userId) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    // WebRTC Signaling
    socket.on("incoming-call", (payload) => {
      io.to(payload.toUserId).emit("incoming-call", payload);
    });

    socket.on("call-signal", (payload) => {
      io.to(payload.toUserId).emit("call-signal", payload);
    });

    socket.on("call-accepted", (payload) => {
      io.to(payload.toUserId).emit("call-accepted", payload);
    });

    socket.on("call-ended", (payload) => {
      io.to(payload.toUserId).emit("call-ended", payload);
    });

    // Chat Messages
    socket.on("send-message", (payload) => {
      io.to(payload.receiverId).emit("new-message", payload);
      // Also emit back to sender to confirm, if desired, but we can rely on UI state
    });

    socket.on("send-notification", (payload) => {
      io.to(payload.userId).emit("new-notification", payload);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io server running at ws://${hostname}:${port}`);
  });
});
