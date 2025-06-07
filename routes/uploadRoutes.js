import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { cloudStorage } from '../config/cloudinary.js'; // Import Cloudinary storage configuration
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a storage engine
const isProduction = process.env.NODE_ENV === 'production';

let storage;

if (isProduction) {
  storage = cloudStorage;
} else {
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
}

// Accept only image files
const fileFilter = (req, file, cb) => {
const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported file format'), false);
};

const upload = multer({ storage });

// Upload route
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const isProduction = process.env.NODE_ENV === 'production';
  const imageUrl = isProduction ? req.file.path : `http://localhost:5000/uploads/${req.file.filename}`;
  // In production, the path is the URL provided by Cloudinary
  // In development, it is a local URL
  return res.status(200).json({ imageUrl });
});

export default router;
