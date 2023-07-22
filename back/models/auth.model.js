const mongoose = require("mongoose");

const userModel = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    min: 3,
    max: 20,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userModel);
