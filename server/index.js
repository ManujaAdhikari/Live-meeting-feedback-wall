require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const { Session, Question } = require("./models");

const app = express();
const server = http.createServer(app);
const FRONTEND = process.env.FRONTEND_URL || "*";
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors({origin:FRONTEND}));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB error:", err.message));

app.get("/", (req, res) => res.send("Server running "));

// create a session (makes a secret host key)
app.post("/api/sessions", async (req, res) => {
  try {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const hostKey = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const session = await Session.create({ code, title: req.body.title, hostKey });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Could not create session" });
  }
});

// get a session and its questions (never send the host key)
app.get("/api/sessions/:code", async (req, res) => {
  try {
    const session = await Session.findOne({ code: req.params.code }).select("-hostKey");
    if (!session) return res.status(404).json({ error: "Session not found" });
    const questions = await Question.find({ sessionCode: req.params.code }).sort({ votes: -1 });
    res.json({ session, questions });
  } catch (err) {
    res.status(500).json({ error: "Could not load session" });
  }
});

// live events
io.on("connection", (socket) => {
  socket.on("join-session", (code) => socket.join(code));

  socket.on("question:new", async ({ code, text }) => {
    try {
      if (!text || !text.trim()) return;
      const q = await Question.create({ sessionCode: code, text: text.trim().slice(0, 200) });
      io.to(code).emit("question:added", q);
    } catch (err) {
      console.log("question:new error:", err.message);
    }
  });

  socket.on("question:upvote", async ({ code, id, clientId }) => {
    try {
      const q = await Question.findOneAndUpdate(
        { _id: id, voters: { $ne: clientId } },
        { $inc: { votes: 1 }, $push: { voters: clientId } },
        { returnDocument: "after" }
      );
      if (q) io.to(code).emit("question:updated", q);
    } catch (err) {
      console.log("question:upvote error:", err.message);
    }
  });

  socket.on("question:status", async ({ code, id, status, hostKey }) => {
    try {
      if (!hostKey) return;
      if (!["visible", "answered", "hidden"].includes(status)) return;
      const isHost = await Session.exists({ code, hostKey });
      if (!isHost) return;
      const q = await Question.findOneAndUpdate(
        { _id: id, sessionCode: code },
        { status },
        { returnDocument: "after" }
      );
      if (q) io.to(code).emit("question:updated", q);
    } catch (err) {
      console.log("question:status error:", err.message);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on port " + PORT));