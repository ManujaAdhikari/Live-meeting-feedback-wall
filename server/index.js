require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const { Session, Question } = require("./models");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB error:", err.message));

app.get("/", (req, res) => res.send("Server running"));

// create a session
app.post("/api/sessions", async (req, res) => {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const session = await Session.create({ code, title: req.body.title });
  res.json(session);
});

// get a session and its questions
app.get("/api/sessions/:code", async (req, res) => {
  const session = await Session.findOne({ code: req.params.code });
  if (!session) return res.status(404).json({ error: "Session not found" });
  const questions = await Question.find({ sessionCode: req.params.code }).sort({ votes: -1 });
  res.json({ session, questions });
});

// live events
io.on("connection", (socket) => {
  socket.on("join-session", (code) => socket.join(code));

  socket.on("question:new", async ({ code, text }) => {
    if (!text || !text.trim()) return;
    const q = await Question.create({ sessionCode: code, text: text.trim() });
    io.to(code).emit("question:added", q);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on port " + PORT));