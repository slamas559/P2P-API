// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: {
      type: String,
    },
    image: { type: String, default: null },
    seen: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24 hours = 60 * 60 * 24 seconds
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
