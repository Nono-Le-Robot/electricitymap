const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
  pointName: {
    type: String,
    required: true,
    trim: true,
  },
  pointDescription: {
    type: String,
    required: true,
  },
  coords: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  photos: [
    {
      type: String,
    },
  ],
  addBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  spotState: {
    type: Boolean,
    default: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  reports: {
    type: Number,
    default: 0,
  },
  commentaires: [
    {
      type: String,
    },
  ],
  addedDate: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Point", pointSchema);
