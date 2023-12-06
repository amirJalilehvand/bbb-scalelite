const { body, validationResult } = require("express-validator/check");

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.httpStatusCode = ValidationErrorHttpStatusCode;
    error.customCode = error.customCode ? error.customCode : "9";
    return next(error);
  } else {
    return next();
  }
};

exports.tokenValidator = () => {
  return [
    body("token")
      .trim()
      .notEmpty()
      .withMessage(TokenValidationErrorMsg)
      .custom((value, { req }) => {
        return new Promise((resolve, reject) => {
          if (value === process.env.THE_TOKEN) resolve(true);
          else reject(new Error(TokenValidationErrorMsg));
        });
      }),
  ];
};

exports.createServerValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage(ServerTaskNameValidationErrorMsg),
    body("id")
      .trim()
      .notEmpty()
      .withMessage(ServerTaskIdValidationErrorMsg)
      .isNumeric()
      .withMessage(ServerTaskIdValidationErrorMsg),
    body("ip").trim().notEmpty().withMessage(ServerTaskIpValidationErrorMsg),
    body("baseUrl")
      .trim()
      .notEmpty()
      .withMessage(ServerTaskBaseUrlValidationErrorMsg),
    body("secretKey")
      .trim()
      .notEmpty()
      .withMessage(ServerTaskSecretKeyValidationErrorMsg),
    body("max")
      .trim()
      .notEmpty()
      .withMessage(ServerTaskMaxParticipantValidationErrorMsg)
      .isNumeric()
      .withMessage(ServerTaskMaxParticipantValidationErrorMsg),
  ];
};

exports.editServerValidator = () => {
  return [
    body("id")
      .trim()
      .notEmpty()
      .withMessage(ServerTaskIdValidationErrorMsg)
      .isNumeric()
      .withMessage(ServerTaskIdValidationErrorMsg),
  ];
};

exports.fetchOneServerValidator = () => {
  return [
    body("id")
      .trim()
      .notEmpty()
      .withMessage(ServerTaskIdValidationErrorMsg)
      .isNumeric()
      .withMessage(ServerTaskIdValidationErrorMsg),
  ];
};

exports.startMeetingValidator = () => {
  return [
    body("scaleliteType")
      .trim()
      .custom((value, { req }) => {
        return new Promise((resolve, reject) => {
          if (value === "default" || value === "dedicated") resolve(true);
          else {
            req.body.scaleliteType = "default";
            resolve();
          }
        });
      }),
    body("meetingId")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskMeetingIdValidationErrorMsg),
    body("meetingName")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskMeetingNameValidationErrorMsg),
    body("moderatorPassword")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskModeratorPasswordValidationErrorMsg),
    body("attendeePassword")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskAttendeePasswordValidationErrorMsg),
    /*body('maxParticipants')
            .trim()
            .notEmpty().withMessage(MeetingTaskMaxParticipantsValidationErrorMsg)
            ,*/
  ];
};

exports.joinMeetingValidator = () => {
  return [
    body("scaleliteType")
      .trim()
      .custom((value, { req }) => {
        return new Promise((resolve, reject) => {
          if (value === "default" || value === "dedicated") resolve(true);
          else {
            req.body.scaleliteType = "default";
            resolve();
          }
        });
      }),
    body("meetingId")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskMeetingIdValidationErrorMsg),
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskFullNameValidationErrorMsg),
    body("moderatorPassword")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskModeratorPasswordValidationErrorMsg),
  ];
};

exports.endMeetingValidator = () => {
  return [
    body("scaleliteType")
      .trim()
      .custom((value, { req }) => {
        return new Promise((resolve, reject) => {
          if (value === "default" || value === "dedicated") resolve(true);
          else {
            req.body.scaleliteType = "default";
            resolve();
          }
        });
      }),
    body("meetingId")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskMeetingIdValidationErrorMsg),
    body("moderatorPassword")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskModeratorPasswordValidationErrorMsg),
  ];
};

exports.monitoringMeetingValidator = () => {
  return [
    body("scaleliteType")
      .trim()
      .custom((value, { req }) => {
        return new Promise((resolve, reject) => {
          if (value === "default" || value === "dedicated") resolve(true);
          else {
            req.body.scaleliteType = "default";
            resolve();
          }
        });
      }),
    body("meetingId")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskModeratorPasswordValidationErrorMsg),
  ];
};

exports.monitoringServerValidator = () => {
  return [
    body("scaleliteType")
      .trim()
      .custom((value, { req }) => {
        return new Promise((resolve, reject) => {
          if (value === "default" || value === "dedicated") resolve(true);
          else {
            req.body.scaleliteType = "default";
            resolve();
          }
        });
      }),
  ];
};

exports.recordIdValidator = () => {
  return [
    body("recordId")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskRecordIdValidationErrorMsg),
  ];
};

exports.publishRecordingValidator = () => {
  return [
    body("publish")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskPublishRecordingValidationErrorMsg),
  ];
};

exports.recordingTaskMeetingIdValidator = () => {
  return [
    body("meetingId")
      .trim()
      .notEmpty()
      .withMessage(MeetingTaskModeratorPasswordValidationErrorMsg),
  ];
};
