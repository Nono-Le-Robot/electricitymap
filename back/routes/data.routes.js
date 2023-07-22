const router = require("express").Router();
const dataController = require("../controllers/data.controller");

//route data
router.get("/get-points", dataController.getAllPoints);

module.exports = router;
