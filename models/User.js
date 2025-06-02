import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const WalletSchema = new mongoose.Schema({
  exchange: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function() { return !this.isGoogleUser; },
    },
    googleId: { type: String },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      // select: false, // Don't return password in queries
      required: function () {
        return !this.isGoogleUser; // Only require password if not using Google auth
      },
    },
    isGoogleUser: {
    type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'dealer'],
      default: 'user',
    },
    bio: String,
    wallets: [WalletSchema],
  },
  { timestamps: true }
);

userSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};


export const User = mongoose.model('User', userSchema);
