const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  idUser: {
    type: String,
    required: true,
  },
  eventName: {
    type: String,
    required: true,
  },
  eventDescription: {
    type: String,
  },
  animationDescription : {
      type: String,
  },
  participation: {
      type: Number,
  },
  registration: [
    String,
  ],
  participantsDetails: [{
    Fee: { type: String, },
    username: { type: String, },
    userId: { type: String, },
    comment: { type: String, },
  }
  ],
  eventInformations: {
    type: String,
  },
  coords: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
  distance: {
    type: String,
    required: true,
  },
  iframe: {
    type: String,
    default:""
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  startHour: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
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
  needValidate: {
    type: Boolean,
    required: true,
    default: true,
  },
});

module.exports = mongoose.model("Event", eventSchema);
