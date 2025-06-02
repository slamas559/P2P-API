import express from "express"
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/isAdmin.js'
import { TradeRequest } from '../models/TradeRequest.js'


const router = express.Router();

// @route POST /api/trades
// @desc Admin creates a trade request
// @access Private (Admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { type, crypto, amount, price, paymentMethod } = req.body;
    if (!type || !crypto || !amount || !price || !paymentMethod) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const trade = new TradeRequest({
      type,
      crypto,
      amount,
      price, 
      paymentMethod,
      createdBy: req.user.id
    });

    await trade.save();
    return res.status(201).json(trade);
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route GET /api/trades
// @desc Public - list all trades
router.get('/', async (req, res) => {
  try {
    const trades = await TradeRequest.find().populate('createdBy', 'name email').sort({ createdAt: -1 });;
    return res.json(trades);
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
});


router.put('/update/:id', auth, admin, async (req, res) => {
  try {
    const updatedTrade = await TradeRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedTrade);
  } catch (err) {
    console.error('Failed to update trade:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE trade
router.delete('/delete/:id', auth, admin, async (req, res) => {
  try {
    await TradeRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trade deleted' });
  } catch (err) {
    console.error('Failed to delete trade:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
