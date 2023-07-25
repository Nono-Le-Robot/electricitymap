const router = require("express").Router();
const dataController = require("../controllers/data.controller");

//route data
router.get("/get-all-points", dataController.getAllPoints);
router.get("/get-my-data", dataController.getMyData);
router.post("/add-point", dataController.addPoint);
router.post("/delete-point", dataController.deletePoint);
router.post("/modify-point", dataController.modifyPoint);
router.post("/update-point-coordinates", dataController.updatePointCoordinates);

module.exports = router;
