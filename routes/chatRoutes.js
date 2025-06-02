import express from "express";
import { auth } from "../middleware/auth.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import mongoose from "mongoose";

const router = express.Router();

/**
 * Create or reuse a conversation between the logged-in user and another user (e.g. trade creator)
 * @body { receiverId: String }
 */
router.post("/conversation", auth, async (req, res) => {
  const { receiverId } = req.body;

  if (!receiverId) {
    return res.status(400).json({ msg: "Receiver ID is required" });
  }

  try {
    // Reuse conversation if it exists
    const existing = await Conversation.findOne({
      members: { $all: [req.user.id, receiverId] },
    });

    if (existing) return res.json(existing);

    // Create new conversation
    const newConversation = new Conversation({
      members: [req.user.id, receiverId],
    });

    await newConversation.save();
    return res.status(201).json(newConversation);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.get("/conversations", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.user.id] },
    }).populate("members", "name email _id").sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * Send a message
 * @body { conversationId: String, text: String }
 */
router.post("/message", auth, async (req, res) => {
  const { conversationId, text, receiver } = req.body;

  if (!conversationId || !text) {
    return res.status(400).json({ msg: "Conversation ID and message text are required" });
  }

  try {
    const newMessage = new Message({
      conversationId,
      sender: req.user.id,
      text,
      receiver: receiver,
    });

    await newMessage.save();
    return res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

/**
 * Get all messages in a conversation
 * @param {conversationId} : String
 */
router.get("/messages/:conversationId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });

    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// routes/chat.js

router.get('/unread-per-conversation/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ msg: "Invalid user ID" });
  }

  try {
    const counts = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(userId),
          seen: false
        }
      },
      {
        $group: {
          _id: "$conversationId",
          receiver: { $first: "$receiver" },
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
      
    });

    return res.json(countMap);
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/mark-seen', async (req, res) => {
  const { conversationId, userId } = req.body;
  try {
    await Message.updateMany(
      { conversationId, receiver: userId, seen: false },
      { $set: { seen: true } }
    );
    return res.json({ msg: "Marked as seen" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.get('/debug-messages/:userId', async (req, res) => {
  const { userId } = req.params;

  const messages = await Message.find({
    receiver: new mongoose.Types.ObjectId(userId),
    // seen: false
    // text: "bebebe"
  });

  return res.json(messages);
});


export default router;
