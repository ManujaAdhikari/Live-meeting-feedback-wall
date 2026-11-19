require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { Session } = require("./models");

const app = express();
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

// get a session by code
app.get("/api/sessions/:code", async (req, res) => {
  const session = await Session.findOne({ code: req.params.code });
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json(session);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));