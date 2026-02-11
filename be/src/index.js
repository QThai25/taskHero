// server.js
const dotenv = require("dotenv");
const path = require("path");
require("dotenv").config();
console.log("ENV MONGO_URI =", process.env.MONGO_URI);
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { setSocketIo } = require("./scripts/reminderScheduler"); // hàm để scheduler nhận io
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS config - thêm origin cho socket.io client nếu cần
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Connect DB
const mongoUri = process.env.MONGO_URI;

const auth = require("./middleware/auth");

// Public routes
app.use("/api/auth", require("./routes/auth"));

// Protected routes
app.use("/api/tasks", auth, require("./routes/tasks"));
app.use("/api/stats", auth, require("./routes/stats"));
app.use("/api/badges", auth, require("./routes/badges"));
app.use("/api/reminders", auth, require("./routes/reminders"));
app.use("/api/profile", auth, require("./routes/profile"));
app.use("/api/chat", auth, require("./routes/chat.routes"));
app.get("/", (req, res) => res.json({ message: "TaskHero API is running" }));

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// create HTTP server & attach socket.io
const server = http.createServer(app);

// socket.io setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Helper: verify JWT and return payload (assuming you use JWT with userId)
function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    // token may be "Bearer <token>" or just the token
    const pure = token.startsWith("Bearer ") ? token.slice(7) : token;
    return jwt.verify(pure, secret);
  } catch (err) {
    return null;
  }
}

io.on("connection", (socket) => {
  console.log("🔌 socket connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId.toString());
    console.log(`✅ socket ${socket.id} joined room ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
  });
});
// Make io available to other modules (scheduler)
setSocketIo(io);

// start scheduler cron if you want inside scheduler module (optional)
const { startCron } = require("./scripts/reminderScheduler");
connectDB(mongoUri).then(() => {
  console.log("MongoDB connected.");
  startCron();
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
