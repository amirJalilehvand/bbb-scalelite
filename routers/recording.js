const { Router } = require("express");

const recordingController = require("../controllers/recording.js");
const {
  validate,
  monitoringServerValidator,
  recordIdValidator,
  publishRecordingValidator,
  recordingTaskMeetingIdValidator,
  serverIdValidator,
} = require("../hooks/validationHandler");

const router = Router();

router.post(
  "/get-recordings",
  serverIdValidator(),
  validate,
  recordingController.getRecordings
);
router.post(
  "/publish-recordings",
  serverIdValidator(),
  recordIdValidator(),
  publishRecordingValidator(),
  validate,
  recordingController.publishRecordings
);
router.post(
  "/delete-recording",
  serverIdValidator(),
  recordIdValidator(),
  validate,
  recordingController.deleteRecording
);
router.post(
  "/get-recording-text-tracks",
  monitoringServerValidator(),
  recordIdValidator(),
  validate,
  recordingController.getRecordingTextTracks
);
router.post(
  "/get-meeting-recordings",
  recordingTaskMeetingIdValidator(),
  validate,
  recordingController.getRecordingsByMeetingId
);

module.exports = router;
