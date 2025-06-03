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
import { Server } from "socket.io"; // Import socket.io server


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://p2-p-frontend-ruddy.vercel.app', // your frontend domain
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const allowedOrigins = [
  'http://localhost:5173',
  'https://p2-p-frontend-ruddy.vercel.app',
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// Middleware

app.use(express.json());

app.use('/api/auth', apiRoutes);
app.use('/api/user', userRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminStatsRoutes); // <- new route for admin stats


app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key_here',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());


// const io = initSocket(server); // Initialize socket.io

// Test route
app.get('/', (req, res) => {
  res.send('API is running now...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
