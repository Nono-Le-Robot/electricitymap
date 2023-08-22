const router = require("express").Router();
const dataController = require("../controllers/data.controller");

//route data
router.post("/app-version", dataController.appVersion);
router.get("/get-all-events", dataController.getAllEvents);
router.get("/get-all-points", dataController.getAllPoints);
router.get("/get-my-data", dataController.getMyData);
router.post("/add-point", dataController.addPoint);
router.post("/delete-point", dataController.deletePoint);
router.post("/modify-point", dataController.modifyPoint);
router.post("/update-point-coordinates", dataController.updatePointCoordinates);
router.post("/update-event-coordinates", dataController.updateEventCoordinates);
router.get("/get-events", dataController.getEvents);
router.post("/create-event", dataController.createEvent);
router.post("/modify-username", dataController.modifyUsername);

module.exports = router;
