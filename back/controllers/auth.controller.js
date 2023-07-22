const userModel = require("../models/auth.model.js");
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
  const newUser = await new userModel({
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
          function generateAcessToken(data) {
            return jwt.sign({ data }, process.env.ACCESS_TOKEN_SECRET, {
              expiresIn: "30d",
            });
          }
          const acessToken = generateAcessToken(user);
          res.status(200).json({
            userId: user._id,
            username: user.username,
            email: req.body.email,
            token: acessToken,
            password: undefined,
          });
        })
        .catch((err) => res.status(401).send(err.message));
    })
    .catch((err) => res.status(401).send(err.message));
};
