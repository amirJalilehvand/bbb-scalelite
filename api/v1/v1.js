const { Router } = require("express");

const roomRouter = require("../../routers/room");
const monitoringRouter = require("../../routers/monitoring.js");
const recordingRouter = require("../../routers/recording.js");
const serverRouter = require("../../routers/server.js");

const router = Router();

router.use("/room", roomRouter);
router.use("/monitoring", monitoringRouter);
router.use("/recording", recordingRouter);
router.use("/server", serverRouter);

module.exports = router;
