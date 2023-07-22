const userModel = require("../models/auth.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.register = async (req, res) => {
  const { username, password } = req.body;
  const checkUser = await userModel.findOne({ username });

  if (checkUser) {
    return res
      .status(409)
      .json({ msg: "Username already used", status: false });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await new userModel({
    username: username,
    password: hashedPassword,
  });

  newUser
    .save()
    .then(() => {
      res.status(200).json({ msg: "user created", username: username });
    })
    .catch((err) => {
      res.status(400).json({ error: err.message });
    });
};

module.exports.login = async (req, res) => {
  userModel
    .findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ msg: "User not found", status: false });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(400).json({
              msg: "Username or password invalid",
              status: false,
            });
          }
          function generateAcessToken(data) {
            return jwt.sign({ data }, process.env.ACCESS_TOKEN_SECRET, {
              expiresIn: "30d",
            });
          }
          const acessToken = generateAcessToken(user);
          res.status(200).json({
            userId: user._id,
            username: req.body.username,
            iat: acessToken,
            password: undefined,
          });
        })
        .catch((error) => res.status(401).send(error.message));
    })
    .catch((error) => res.status(401).send(error.message));
};
