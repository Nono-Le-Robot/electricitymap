const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userModel = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (value) => emailRegex.test(value),
      message: "Please enter a valid email address",
    },
  },
  username: {
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
  picture : {
    type : String, 
    default : "https://electricitymap.fr/backend/images/default/default-profile-picture.jpg"
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likedUsers:
    [
      String
    ],
  likers:
    [
      String
    ],
  dislikedUsers:
    [
      String
    ],
  dislikers:
    [
      String
    ],
    likeEvent:
    [
      String
    ],
});

module.exports = mongoose.model("User", userModel);
