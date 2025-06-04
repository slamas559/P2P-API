import { Server } from "socket.io";
import dotenv from "dotenv";
import { Message } from "../models/Message"; // adjust path to your model
import mongoose from "mongoose";
dotenv.config();

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

    socket.on("send_message", async (data) => {
    try {
      const { sender, receiver, text, conversationId } = data;

      // 1. Save to DB
      const newMsg = new Message({
        sender: mongoose.Types.ObjectId(sender),
        receiver: mongoose.Types.ObjectId(receiver),
        text,
        conversationId: mongoose.Types.ObjectId(conversationId),
      });

      let savedMsg = await newMsg.save();

      // 2. Populate sender and receiver
      savedMsg = await savedMsg.populate([
        { path: "sender", select: "_id name" },
        { path: "receiver", select: "_id name" }
      ]);

      // 3. Emit full message to others
      io.to(conversationId).emit("receive_message", savedMsg);

    } catch (error) {
      console.error("❌ Error handling message:", error);
    }
  });

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
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