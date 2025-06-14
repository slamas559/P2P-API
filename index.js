import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import http from "http";
import { initSocket } from "./config/socket.js"; // <- new file
import apiRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";  
import tradeRoutes from "./routes/tradeRoutes.js";  
import chatRoutes from "./routes/chatRoutes.js";
import adminStatsRoutes from "./routes/adminStatsRoutes.js"; // <- new file
import session from "express-session";
import passport from "passport";
import "./config/passport.js"; // Initialize passport config
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './routes/uploadRoutes.js';
import MongoStore from 'connect-mongo';


const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


dotenv.config();
connectDB();

const app = express();



const allowedOrigins = [
  'http://localhost:5173',
  'https://p2-p-frontend-ruddy.vercel.app',
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));




const server = http.createServer(app);
// Middleware

app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  // Serve static files from the "uploads" directory in development
  const __dirname = path.resolve();
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

app.use('/api/auth', apiRoutes);
app.use('/api/user', userRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminStatsRoutes); // <- new route for admin stats
// app.use('/uploads', express.static('uploads'));
app.use('/api',uploadRoutes); // <- new route for file uploads

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key_here',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // your MongoDB connection string
      ttl: 14 * 24 * 60 * 60, // = 14 days
    }),
    cookie: {
      secure: true, // set true if using HTTPS
      sameSite: "none", // needed for cross-origin cookies (e.g., Vercel + Railway)
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const io = initSocket(server); // Initialize socket.io

// Test route
app.get('/', (req, res) => {
  res.send('API is running now...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
