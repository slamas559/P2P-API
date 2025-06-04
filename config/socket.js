import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Message } from "../models/Message.js"; // Adjust if you're using named export

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
    transports: ["websocket"]
  });

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId.toString());
    });

    socket.on("join_user", (userId) => {
      socket.join(userId.toString());
    });

    socket.on("send_message", async (data) => {
      try {
        const { sender, receiver, text, conversationId } = data;

        const newMsg = new Message({
          sender: mongoose.Types.ObjectId(sender),
          receiver: mongoose.Types.ObjectId(receiver),
          text,
          conversationId: mongoose.Types.ObjectId(conversationId),
        });

        let savedMsg = await newMsg.save();

        savedMsg = await savedMsg.populate([
          { path: "sender", select: "_id name" },
          { path: "receiver", select: "_id name" }
        ]);

        io.to(conversationId.toString()).emit("receive_message", savedMsg);
        io.to(receiver.toString()).emit("receive_message", savedMsg);

      } catch (error) {
        console.error("❌ Error handling message:", error);
      }
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
