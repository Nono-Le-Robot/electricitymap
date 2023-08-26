const e = require("express");
const userModel = require("../models/auth.model.js");
const pointsModel = require("../models/points.model.js");
const eventsModel = require("../models/events.model.js");

module.exports.appVersion = async (req, res) => {
  const appVersion = "v1.3";
  const userVersion = req.body.userVersion;
  if (appVersion === userVersion) {
    res.send({
      serverVersion: appVersion,
      userVersion: userVersion,
      needUpdate: false,
    });
  } else {
    res.send({
      serverVersion: appVersion,
      userVersion: userVersion,
      needUpdate: true,
    });
  }
};

module.exports.modifyUsername = async (req, res) => {
  const { username, newUsername } = req.body;
  try {
    const user = await userModel.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    user.username = newUsername;
    await user.save();
    await pointsModel.updateMany(
      { addedBy: username },
      { $set: { addedBy: newUsername } }
    );
    await eventsModel.updateMany(
      { createdBy: username },
      { $set: { createdBy: newUsername } }
    );

    res.json({
      message: "Données utilisateur mises à jour avec succès",
      user: {
        oldUsername: username,
        newUsername: newUsername,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour des données utilisateur",
      error: error,
    });
  }
};

module.exports.getMyData = async (req, res) => {
  const { username } = req.body;
  try {
    const existingUser = await userModel.findById(username);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the point properties
    existingUser.username = username;

    // Save the updated point
    await existingUser.save();

    res.json({
      message: "user updated successfully",
      user: {
        newUsername: username,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while updating the point",
      error: error.message,
    });
  }
};

// ... (autres imports)

module.exports.modifyPoint = async (req, res) => {
  if (req.user === req.body.idUser || req.role === "admin") {
  const {token, idUser, pointId, pointName, pointDescription, priseType} = req.body;
  if (req.user === idUser ){
  try {
    const existingPoint = await pointsModel.findById(pointId);
    console.log(existingPoint);
    if (!existingPoint) {
      return res.status(404).json({ message: "Point not found" });
    }

    // Update the point properties
    existingPoint.pointName = pointName;
    existingPoint.pointDescription = pointDescription;
    existingPoint.priseType = priseType;

    // Save the updated point
    await existingPoint.save();

    res.json({
      message: "Point updated successfully",
      point: {
        pointId: existingPoint._id,
        pointName: existingPoint.pointName,
        pointDescription: existingPoint.pointDescription,
        coords: existingPoint.coords,
        addedBy: existingPoint.addedBy,
        priseType: existingPoint.priseType,
        spotState: existingPoint.spotState,
        needValidate: existingPoint.needValidate,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'update du point",
      error: error.message,
    });
  }
  }else{
    res.status(500).json({
      message: "Erreur lors de l'update du point",
      error: error.message,
    });
  
  
  }
  } else {
    res.status(500).json({
      message: "Erreur lors de l'update du point",
      error: error.message,
    });
}
};

// ... (autres fonctions)
module.exports.updatePointCoordinates = async (req, res) => {
  const { pointId, lat, lng } = req.body;
  try {
    const existingPoint = await pointsModel.findById(pointId);
    if (!existingPoint) {
      return res.status(404).json({ message: "Point not found" });
    }

    // Update the point coordinates
    existingPoint.coords.lat = lat;
    existingPoint.coords.lng = lng;

    // Save the updated point
    await existingPoint.save();

    res.json({
      message: "Point coordinates updated successfully",
      point: {
        pointId: existingPoint._id,
        pointName: existingPoint.pointName,
        pointDescription: existingPoint.pointDescription,
        coords: existingPoint.coords,
        addedBy: existingPoint.addedBy,
        priseType: existingPoint.priseType,
        spotState: existingPoint.spotState,
        needValidate: existingPoint.needValidate,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while updating the point coordinates",
      error: error.message,
    });
  }
};

module.exports.updateEventCoordinates = async (req, res) => {
  const { pointId, lat, lng } = req.body;
  try {
    const existingPoint = await eventsModel.findById(pointId);
    if (!existingPoint) {
      return res.status(404).json({ message: "Point not found" });
    }

    // Update the point coordinates
    existingPoint.coords.lat = lat;
    existingPoint.coords.lng = lng;

    // Save the updated point
    await existingPoint.save();

    res.json({
      message: "Point coordinates updated successfully",
      point: {
        pointId: existingPoint._id,
        eventName: existingPoint.pointName,
        eventDescription: existingPoint.pointDescription,
        eventInformations: existingPoint.pointInformations,
        distance: existingPoint.distance,
        iframe: existingPoint.iframe,
        coords: existingPoint.coords,
        createdBy: existingPoint.addedBy,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while updating the point coordinates",
      error: error.message,
    });
  }
};

module.exports.getAllPoints = async (req, res) => {
  // try {
  //   const points = await pointsModel.find().exec();
  //   const users = await userModel.find().exec();

  //   const emailToUserIdMap = {};
  //   users.forEach(user => {
  //     emailToUserIdMap[user.email] = user._id;
  //   });

  //   const updatePromises = points.map(async (point) => {
  //     const userId = emailToUserIdMap[point.email];
  //     console.log(userId);
  //     const objectIdString = userId.toHexString();
  //     console.log(objectIdString);
  //     if (objectIdString) {
  //     console.log('lala');
  //       await pointsModel.updateOne({ _id: point._id }, { idUser: objectIdString });
  //     }
  //   });

  //   await Promise.all(updatePromises);

  //   res.status(200).send("Points mis à jour avec succès.");
  // } catch (err) {
  //   res.status(500).send(err.message);
  // }
  pointsModel.find().exec(function (err, events) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send(events);
    }
  });
};
module.exports.getAllEvents = async (req, res) => {
  // try {
  //   const points = await eventsModel.find().exec();
  //   const users = await userModel.find().exec();

  //   const emailToUserIdMap = {};
  //   users.forEach(user => {
  //     emailToUserIdMap[user.email] = user._id;
  //   });

  //   const updatePromises = points.map(async (point) => {
  //     const userId = emailToUserIdMap[point.email];
  //     console.log(userId);
  //     const objectIdString = userId.toHexString();
  //     console.log(objectIdString);
  //     if (objectIdString) {
  //       console.log('lala');
  //       await eventsModel.updateOne({ _id: point._id }, { idUser: objectIdString });
  //     }
  //   });
  //   await Promise.all(updatePromises);

  //   res.status(200).send("Points mis à jour avec succès.");
  // } catch (err) {
  //   res.status(500).send(err.message);
  // }




  eventsModel.find().exec(function (err, events) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send(events);
    }
  });
};
module.exports.getEvents = async (req, res) => {
  eventsModel.find().exec(function (err, events) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send(events);
    }
  });
};

module.exports.deletePoint = async (req, res) => {
if(req.user === req.body.idUser || req.role === "admin") {


  pointsModel.deleteOne({ _id: req.body.pointId }).exec(function (err, point) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      console.clear();
      res.status(200).send(point);
    }
  });
}else{
  res.status(500).send("Vous n'etes pas le créateur de ce point");
}
};

module.exports.addPoint = async (req, res) => {
  userModel
    .findOne({ email: req.body.email })
    .select("-password")
    .then(async (user) => {
      if (!user) {
        return res.json({ msg: "User not found", status: false });
      } else {
        const {
          email,
          idUser = user._id,
          pointName,
          pointDescription,
          coords,
          addedBy,
          priseType,
          spotState,
          needValidate,
        } = req.body;
        const checkUser = await userModel.findOne({ email });

        if (!checkUser) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        } else {
          const newPoint = new pointsModel({
            email,
            idUser,
            pointName,
            pointDescription,
            coords,
            addedBy,
            priseType,
            spotState,
            needValidate,
          });
          await newPoint.save();
          res.json({
            message: "Point ajouté avec succès",
            point: {
              pointName: newPoint.pointName,
              pointDescription: newPoint.pointDescription,
              coords: newPoint.coords,
              addedBy: newPoint.addedBy,
              priseType: newPoint.priseType,
              spotState: newPoint.spotState,
              needValidate: newPoint.needValidate,
            },
          });
        }
      }
    })
    .catch((error) => res.status(401).send(error.message));
};

module.exports.createEvent = async (req, res) => {

  userModel
    .findOne({ email: req.body.email })
    .select("-password")
    .then(async (user) => {
      if (!user) {
        return res.json({ msg: "User not found", status: false });
      } else {
        const {
          createdBy,
          email,
          idUser = user._id,
          eventName,
          eventDescription,
          eventInformations,
          coords,
          distance,
          iframe,
          startDate,
          endDate,
          startHour,
          addedDate,
          needValidate,
        } = req.body;
        const checkUser = await userModel.findOne({ email });

        if (!checkUser) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        } else {
          // a modifier si bug
          const newEvent = new eventsModel({
            createdBy,
            email,
            idUser,
            eventName,
            eventDescription,
            eventInformations,
            coords,
            distance,
            iframe,
            startDate,
            endDate,
            startHour,
            addedDate,
            needValidate,
          });
          await newEvent.save();
          res.json({
            message: "Event créer avec succées",
            event: {
              createdBy: newEvent.createdBy,
              email: newEvent.email,
              eventName: newEvent.eventName,
              eventDescription: newEvent.eventDescription,
              eventInformations: newEvent.eventInformations,
              coords: newEvent.coords,
              distance: newEvent.distance,
              iframe: newEvent.iframe,
              startDate: newEvent.startDate,
              endDate: newEvent.endDate,
              addedDate: newEvent.addedDate,
              needValidate: newEvent.needValidate,
            },
          });
        }
      }
    })
    .catch((error) => res.status(401).send(error.message));
};


module.exports.modifyEvent = async (req, res) => {
  if (req.user === req.body.idUser || req.role === "admin") {
  userModel
    .findOne({ email: req.body.email })
    .select("-password")
    .then(async (user) => {
      if (!user) {
        return res.json({ msg: "User not found", status: false });
      } else {
        const {
          createdBy,
          email,
          idUser = user._id,
          eventName,
          eventDescription,
          eventInformations,
          coords,
          distance,
          iframe,
          startDate,
          endDate,
          startHour,
          addedDate,
          needValidate,
        } = req.body;
        const checkUser = await userModel.findOne({ email });

        if (!checkUser) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        } else {
          const updatedEvent = await eventsModel.findOneAndUpdate(
            { _id: idEventToUpdate }, 
            {
              createdBy,
              email,
              idUser,
              eventName,
              eventDescription,
              eventInformations,
              coords,
              distance,
              iframe,
              startDate,
              endDate,
              startHour,
              addedDate,
              needValidate,
            },
            { new: true } 
          );

          if (!updatedEvent) {
            return res.status(404).json({ message: "Événement non trouvé" });
          }
          res.json({
            message: "Event créer avec succées",
            event: {
              createdBy: newEvent.createdBy,
              email: newEvent.email,
              eventName: newEvent.eventName,
              eventDescription: newEvent.eventDescription,
              eventInformations: newEvent.eventInformations,
              coords: newEvent.coords,
              distance: newEvent.distance,
              iframe: newEvent.iframe,
              startDate: newEvent.startDate,
              endDate: newEvent.endDate,
              addedDate: newEvent.addedDate,
              needValidate: newEvent.needValidate,
            },
          });
        }
      }
    })
    .catch((error) => res.status(401).send(error.message));
  }else {
  res.status(400).json("erreur lors de la modification du l'event")
  }
};


module.exports.deleteEvent = async (req, res) => {
  if (req.user === req.body.idUser || req.role === "admin") {
  const eventIdToDelete = req.params.eventId; // Assurez-vous de passer l'ID de l'événement dans les paramètres de l'URL

  eventsModel.findOneAndDelete({ _id: eventIdToDelete })
    .then((deletedEvent) => {
      if (!deletedEvent) {
        return res.status(404).json({ message: "Événement non trouvé" });
      }
      res.json({ message: "Événement supprimé avec succès", event: deletedEvent });
    })
    .catch((error) => res.status(500).json({ message: "Erreur lors de la suppression de l'événement", error: error.message }));
  }else{
  res.status(404).json("Erreur lors de la suppression de l'event")
  }
};
