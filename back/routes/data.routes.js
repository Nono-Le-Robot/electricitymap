const router = require("express").Router();
const dataController = require("../controllers/data.controller");
const controlAuth = require("../middleware/authUser");
const multerProfil = require("../middleware/multerProfil");

//route data
router.post("/app-version", dataController.appVersion);
router.get("/get-all-events", dataController.getAllEvents);
router.get("/get-all-points", dataController.getAllPoints);
router.get("/get-my-data", dataController.getMyData);
router.post("/add-point", controlAuth.requireAuthAdmin, dataController.addPoint);
router.post("/delete-point", controlAuth.requireAuthAdmin, dataController.deletePoint);
router.post("/modify-point", controlAuth.requireAuthAdmin, dataController.modifyPoint);
router.post("/like-point", controlAuth.requireAuthAdmin, dataController.likePoint);
router.post("/dislike-point", controlAuth.requireAuthAdmin, dataController.dislikePoint);
router.post("/update-point-coordinates", dataController.updatePointCoordinates);
router.post("/update-event-coordinates", dataController.updateEventCoordinates);
router.get("/get-events", dataController.getEvents);
router.post("/create-event", controlAuth.requireAuthAdmin, dataController.createEvent);
router.post("/modify-event", controlAuth.requireAuthAdmin, dataController.modifyEvent);
router.post("/delete-event", controlAuth.requireAuthAdmin, dataController.deleteEvent);
router.post("/registration-event", controlAuth.requireAuthAdmin, dataController.registrationEvent);
router.post("/deregistration-event", controlAuth.requireAuthAdmin, dataController.deregistrationEvent);
router.post("/registrationDetailEvent", controlAuth.requireAuthAdmin, dataController.registrationDetailEvent);
router.post('/modify-username', controlAuth.requireAuthAdmin, dataController.modifyUsername)
router.post("/upload-profil-picture",multerProfil, controlAuth.requireAuthAdmin, dataController.uploadProfilPicture)
router.post('/get-user-by-id', dataController.getUserById)



module.exports = router;
