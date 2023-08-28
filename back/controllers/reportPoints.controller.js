const e = require("express");
const userModel = require("../models/auth.model.js");
const pointsModel = require("../models/points.model.js");
const eventsModel = require("../models/events.model.js");
const reportModel = require("../models/reportPoints.model.js");


module.exports.reportPoint = async (req, res) => {
    const { idPoint, idUser, comment } = req.body
    try {
        
       const User = await userModel.findById(idUser)
        const usernameReporter = User.username
       
        
        const newReport = new reportModel({
            idUserReportPoint: idUser,
            usernameReportPoint: usernameReporter,
            idPoint: idPoint._id,
            idUserCreatorPoint: idPoint.idUser,
            usernameCreatorPoint : idPoint.addedBy,
            comment : comment,
        })
        await newReport.save();
  
        
        await pointsModel.updateOne(
            { _id: idPoint._id }, 
            {
                $inc: { reports: 1 },
                $push: {
                    reportdetail: {
                        reportId: newReport._id,
                        username: usernameReporter,
                        comment: comment,
                    },
                },
            }
        );
        
        if(res){
        res.status(200).json("ok")
        }
    } catch (error){
        console.error(error);
        res.status(500).json({ error: "erreur dans le report" });
    }

};


module.exports.unReportPoint = async (req, res) => {
    const { idPoint, idUser } = req.body
    try {
        const User = await userModel.findById(idUser)
        const usernameReporter = User.username
        await pointsModel.updateOne(
            { _id: idPoint._id },
            {
                $inc: { reports: - 1 },
                $pull: {
                    reportdetail: {
                        username: usernameReporter,
                    },
                },
            }
        );
        if (res) {
            res.status(200).json("ok")
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "erreur dans le report" });
    }

};