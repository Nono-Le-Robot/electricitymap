const jwt = require("jsonwebtoken");
const UserModel = require("../models/auth.model.js");


exports.requireAuthUser = (req, res, next) => {
    const token = req.body.token;
    const userId = req.body.idUser;
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                res.status(401).send("token not found");
            } else {
                UserModel.findOne({ _id: decodedToken.id }, (err, doc) => {
                    if (err) {
                        res.status(400).json("erreur d'autentification")
                    } else {
                        if (decodedToken.id !== userId) {
                            res.status(400).json("erreur d'autentification")
                        } else {
                            req.user = decodedToken.id;
                            next();
                        }
                    }
                })
            }
        });
    } else {
        req.user = "";
        console.log("access denied invalid token ");
        next();
    }
};


exports.requireAuthAdmin = (req, res, next) => {
   console.log(req);
    const token = req.body.token;
    const userId = req.body.idUser;
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
           
            if (err) {
                res.status(401).send("token not found");
            } else {
                if (decodedToken.id === userId) {
                UserModel.findOne({ _id: decodedToken.id, role: "admin" }, (err, doc) => {
                    if (doc !== null) {
                        req.role = "admin"
                        req.user = decodedToken.id;
                        next()
                    } else {
                        requireAuthUser()
                    }
                })
                } else {
                    res.status(400).json("erreur d'autentification")
                }
            }
            
        });
    } else {
        req.role = ""
        req.user = "";
        console.log("access denied invalid token ");
     res.status(400).json("erreur d'autentification")
    }
};


