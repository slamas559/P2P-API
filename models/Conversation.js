// models/Conversation.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const conversationSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Conversation = mongoose.model('Conversation', conversationSchema);
