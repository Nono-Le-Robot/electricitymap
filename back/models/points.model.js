const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  idUser: {
    type: String,
    required: true,
  },
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
  addedBy: {
    type: String,
    required: true,
  },
  priseType: {
    type: String,
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
  
  reportdetail: [{
    reportId: { type: String, },
    username : { type: String, },
    comment: { type: String, },
    }],
   

  commentaires: [
    {
      type: String,
    },
  ],
  addedDate: {
    type: String,
  },
  needValidate: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Point", pointSchema);
