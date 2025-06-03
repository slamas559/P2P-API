import { Server } from "socket.io";
import dotenv from "dotenv";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://p2-p-frontend-ruddy.vercel.app",
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket"] // Optional but recommended for production
  });

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    socket.on("send_message", (data) => {
      socket.broadcast.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};