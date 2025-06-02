import jwt from 'jsonwebtoken';
import express from 'express';
import { User } from '../models/User.js';
import { auth } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get current user info
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
});


// @route   GET /api/users/:id
// @desc    Get public user info by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/users/:id/wallets
// @desc    Add wallet to user profile
// @access  Private

// @route   PUT /api/user/:id
// @desc    Update user profile (owner only)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  if (req.user.id !== req.params.id)
    return res.status(403).json({ msg: 'Unauthorized' });

  try {
    const { name, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, bio },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/:id/wallets', auth, async (req, res) => {
  try {
    const { exchange, name, address } = req.body;
    if (!exchange || !name || !address)
      return res.status(400).json({ msg: 'All fields required' });

    // Only the user themself can add wallet
    if (req.user.id !== req.params.id)
      return res.status(403).json({ msg: 'Unauthorized' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const newWallet = { exchange, name, address };
    user.wallets.push(newWallet);
    await user.save();

    res.json(newWallet);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/user/:id/wallets/:walletId
// @desc    Delete a wallet address
// @access  Private
router.delete('/:id/wallets/:walletId', auth, async (req, res) => {
  if (req.user.id !== req.params.id)
    return res.status(403).json({ msg: 'Unauthorized' });

  try {
    const user = await User.findById(req.params.id);
    user.wallets = user.wallets.filter(
      (wallet) => wallet._id.toString() !== req.params.walletId
    );
    await user.save();
    res.json({ msg: 'Wallet removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;

