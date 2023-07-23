const router = require("express").Router();
const dataController = require("../controllers/data.controller");

//route data
router.get("/get-all-points", dataController.getAllPoints);
router.get("/get-my-data", dataController.getMyData);
router.post("/add-point", dataController.addPoint);
router.post("/delete-point", dataController.deletePoint);

module.exports = router;
