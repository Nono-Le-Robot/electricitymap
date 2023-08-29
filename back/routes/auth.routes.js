const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const controlAuth = require("../middleware/authUser")

//route auth
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/delete", authController.deleteUser);
router.post("/likeUser", controlAuth.requireAuthAdmin, authController.likeUser);
router.post("/unlikeUser", controlAuth.requireAuthAdmin, authController.unlikeUser);
router.post("/dislikeUser", controlAuth.requireAuthAdmin, authController.dislikeUser);
router.post("/undislikeUser", controlAuth.requireAuthAdmin, authController.undislikeUser);

module.exports = router;
