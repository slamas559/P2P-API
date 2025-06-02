import express from "express";
import { User } from "../models/User.js";
import { TradeRequest } from "../models/TradeRequest.js";
import { auth } from "../middleware/auth.js";

import { admin } from "../middleware/isAdmin.js";
import dotenv from 'dotenv';
dotenv.config();


const router = express.Router();

router.get("/stats", auth, admin, async (req, res) => {
    try {
        // Fetching total users, trades, and admins
        const totalUsers = await User.countDocuments();
        const totalTrades = await TradeRequest.countDocuments();
        const totalAdmins = await User.countDocuments({ role: "dealer" });
        
        // Fetching recent activities (if needed)
        // const recentActivities = await ActivityLog.find().sort({ createdAt: -1 }).limit(5).lean();
    
        return res.json({
        totalUsers,
        totalTrades,
        totalAdmins,
        // recentActivities: recentActivities.map(a => a.description),
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Server error" });
    }
}
);

router.put('/make-admin/:userId', auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: 'dealer' },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: `${user.name} is now an admin`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/remove-admin/:userId', auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: 'user' },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: `${user.name} is no longer an admin`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role'); // Select only required fields
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;