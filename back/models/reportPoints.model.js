const mongoose = require("mongoose");

const reportPointSchema = new mongoose.Schema({
    idUserReportPoint: {
        type: String,
        required: true,
        trim: true,
    },
    usernameReportPoint : {
        type: String,
        required: true,
    },
    idPoint: {
        type: String,
        required: true,
        trim: true,
    },
    idUserCreatorPoint :{
        type: String,
        required: true,
        trim: true,
    },
    usernameCreatorPoint: {
        type: String,
        required: true,
        trim: true,
    },
    comment : {
        type: String,
        trim: true,
    }
});

module.exports = mongoose.model("reportPoint", reportPointSchema);
