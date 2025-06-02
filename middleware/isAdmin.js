import { User } from "../models/User.js"

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'dealer') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
};

export const admin = isAdmin;
