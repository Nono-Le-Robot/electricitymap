const userModel = require("../models/auth.model.js");
const pointModel = require("../models/points.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


module.exports.register = async (req, res) => {
  const { email, username, password } = req.body;
  const checkUser = await userModel.findOne({ email });

  if (checkUser) {
    return res
      .status(409)
      .json({ message: "Email already used", status: false });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser =  new userModel({
    email: email,
    username: username,
    password: hashedPassword,
  });

  newUser
    .save()
    .then(() => {
      res
        .status(200)
        .json({ message: "user created", email: email, status: true });
    })
    .catch((err) => {
      res.status(400).json({ message: err.message });
    });
};

module.exports.login = async (req, res) => {
  userModel
    .findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", status: false });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(400).json({
              message: "email or password invalid",
              status: false,
            });
          }
         const generateAcessToken = (data) =>  {
          const email = data.email;
          const id = data._id;
          const username = data.username
            const token = jwt.sign({email, id, username}, process.env.ACCESS_TOKEN_SECRET, {
              expiresIn: '30d',
            })
            return token
          }
          const accessToken = generateAcessToken(user);
          
          res.status(200).json({
            userId: user._id,
            username: user.username,
            email: req.body.email,
            token : accessToken

          });
        })
        .catch((err) => res.status(401).send(err.message));
    })
    .catch((err) => res.status(401).send(err.message));
};


module.exports.deleteUser = async (req, res) => {
  if (req.user === req.body.idUser || req.role === "admin") {
    const UserToDelete = req.user; // Assurez-vous de passer l'ID de l'événement dans les paramètres de l'URL

    eventsModel.findOneAndDelete({ _id: UserToDelete })
      .then((userDelete) => {
        if (!userDelete) {
          return res.status(404).json({ message: "Événement non trouvé" });
        }
        res.json({ message: "utilisateur supprimé avec succès", user: userDelete });
      })
      .catch((error) => res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur", error: error.message }));
  } else {
    res.status(404).json("Erreur lors de la suppression de l'utilisateur")
  }
};


module.exports.likeUser = async (req, res) => {
  if (req.user === req.body.idUser || req.role === "admin") {
    const UserLike = req.body.idUser;
    const UserToLike = req.body.idPoint.idUser;
    const idPoint = req.body.idPoint._id;

    userModel.findByIdAndUpdate(UserToLike, { $push: { likers: UserLike } }, (err, result) => {
      if (err) {
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
      } else {
        userModel.findByIdAndUpdate(UserLike, { $push: { likedUsers: UserToLike } }, (err, result) => {
          if (err) {
            res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur qui a effectué le like." });
          } else {
            pointModel.findByIdAndUpdate(idPoint, { $push: { lovers: UserLike } }, (err, result) => {
              if (err) {
                res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur qui a effectué le like." });
              } else {
                res.status(200).json('like User enregistré avec succèes.');
              }

            })
          }
        });
      }
    });
  } else {
    res.status(403).json({ error: "Non autorisé à effectuer cette action." });
  }
};

module.exports.unlikeUser = async (req, res) => {
 
  if (req.user === req.body.idUser || req.role === "admin") {
    const UserDislike = req.body.idUser;
    const UserToDislike = req.body.idPoint.idUser;
    const idPoint = req.body.idPoint._id;
    console.log(req.body.idPoint);

    userModel.findByIdAndUpdate(UserToDislike, { $pull: { likers: UserDislike } }, (err, result) => {
      if (err) {
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
      } else {
        userModel.findByIdAndUpdate(UserDislike, { $pull: { likedUsers: UserToDislike } }, (err, result) => {
          if (err) {
            res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur qui a effectué le like." });
          } else {
            pointModel.findByIdAndUpdate(idPoint, { $pull: { lovers: UserDislike } }, (err, result) => {if (err) {
              res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur qui a effectué le like." });
            } else {
              res.status(200).json('unlike User enregistré avec succèes.');
            }
            
            })
        
          }
        });
      }
    });
  } else {
    res.status(403).json({ error: "Non autorisé à effectuer cette action." });
  }
};

module.exports.dislikeUser = async (req, res) => {
  console.log(req.body);
  if (req.user === req.body.idUser || req.role === "admin") {
    const UserHater = req.body.idUser;
    const UserToHate = req.body.idPoint.idUser;
    const idPoint = req.body.idPoint._id;

    userModel.findByIdAndUpdate(UserToHate, { $push: { dislikers: UserHater } }, (err, result) => {
      if (err) {
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
      } else {
        userModel.findByIdAndUpdate(UserHater, { $push: { dislikedUsers: UserToHate } }, (err, result) => {
          if (err) {
            res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur qui a effectué le like." });
          } else {
            pointModel.findByIdAndUpdate(idPoint, { $push: { haters: UserHater } }, (err, result) => {
              if (err) {
                res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur qui a effectué le like." });
              } else {
                res.status(200).json('hate User enregistré avec succèes.');
              }

            })
          }
        });
      }
    });
  } else {
    res.status(403).json({ error: "Non autorisé à effectuer cette action." });
  }
};

module.exports.undislikeUser = async (req, res) => {
  console.log(req.body);
  if (req.user === req.body.idUser || req.role === "admin") {
    const UserUnHate = req.body.idUser;
    const UserToUnHate = req.body.idPoint.idUser;
    const idPoint = req.body.idPoint._id;

    userModel.findByIdAndUpdate(UserToUnHate, { $pull: { dislikers: UserUnHate } }, (err, result) => {
      if (err) {
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
      } else {
        userModel.findByIdAndUpdate(UserUnHate, { $pull: { dislikedUsers: UserToUnHate } }, (err, result) => {
          if (err) {
            res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur qui a effectué le like." });
          } else {
            pointModel.findByIdAndUpdate(idPoint, { $pull: { haters: UserUnHate } }, (err, result) => {
              if (err) {
                res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur qui a effectué le like." });
              } else {
                res.status(200).json('unHate User enregistré avec succèes.');
              }

            })
          }
        });
      }
    });
  } else {
    res.status(403).json({ error: "Non autorisé à effectuer cette action." });
  }
};
