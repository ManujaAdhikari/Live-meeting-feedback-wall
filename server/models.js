const mongoose = require("mongoose");

const Session = mongoose.model("Session", new mongoose.Schema({
  code: String,
  title: String,
}));

const Question = mongoose.model("Question", new mongoose.Schema({
  sessionCode: String,
  text: String,
  votes: { type: Number, default: 0 },
  voters: [String],
  status: { type: String, default: "visible" },
}));

module.exports = { Session, Question };