const mongoose = require("mongoose");

const Session = mongoose.model("Session", new mongoose.Schema({
  code: String,
  title: String,
}));

module.exports = { Session };