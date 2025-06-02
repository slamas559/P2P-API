import jwt from 'jsonwebtoken';
import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import passport from "passport";

import dotenv from 'dotenv';
dotenv.config();


const router = express.Router();

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    
    return res.status(201).json({ token, user: { id: user._id, name, email, role } });

  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
    
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = req.user.generateJWT(); // Create your own JWT method on user model
    res.redirect(`http://localhost:3000/auth-success?token=${token}`);
  }
);

router.post('/google', async (req, res) => {
  const { name, email, googleId } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        isGoogleUser: true,
        password: undefined, // omit password for Google users
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// router.post('/google', async (req, res) => {
//   const { name, email, googleId} = req.body;

//   try {
//     let user = await User.findOne({ email });

//     if (!user) {
//       user = new User({ name, email, googleId});
//       await user.save();
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

//     return res.json({ token, user });
//   } catch (err) {
//     console.error('Google Auth Error:', err);
//     res.status(500).json({ msg: 'Server error' });
//   }
// });


export default router;
