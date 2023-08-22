const router = require("express").Router();
const reportPointsController = require("../controllers/reportPoints.controller");

//route report

router.post("/reportPoint", reportPointsController.reportPoint);

module.exports = router;