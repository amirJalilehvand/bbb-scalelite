const { Router } = require("express");

const monitoringController = require("../controllers/monitoring.js");

const {
  validate,
  monitoringMeetingValidator,
  monitoringServerValidator,
} = require("../hooks/validationHandler");

const router = Router();

router.post(
  "/meeting-running",
  monitoringMeetingValidator(),
  validate,
  monitoringController.getIsMeetingRunning
);
router.post(
  "/get-meeting-info",
  monitoringMeetingValidator(),
  validate,
  monitoringController.getMeetingInfo
);
router.post(
  "/get-meetings",
  monitoringServerValidator(),
  validate,
  monitoringController.getMeetings
);
router.post("/meetings-running", monitoringController.getMeetingsRunning);
router.post(
  "/all-meetings-running",
  monitoringController.getAllMeetingsRunning
);
router.post(
  "/sales-participants-count",
  monitoringController.getMeetingsRunningParticipantsCount
);

module.exports = router;
