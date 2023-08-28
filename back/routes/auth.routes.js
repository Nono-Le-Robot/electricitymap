const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const controlAuth = require("../middleware/authUser")

//route auth
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/delete", authController.deleteUser);

module.exports = router;
