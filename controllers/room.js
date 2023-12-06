const bbb = require("bigbluebutton-js");
const Server = require("../models/server.js");
const Scalelite = require("../models/scalelite.js");
const axios = require("axios");

const checksumNormalizationHandler = require("../hooks/checksumNormalizationHandler");

let httpRequestConfig = {
  headers: {
    Connection: "keep-alive",
    "Keep-Alive": "timeout=60, max=100",
  },
};

let httpRequestParamData = {};

exports.getCreateRoomLink = async (req, res, next) => {
  const scaleliteType = req.body.scaleliteType;
  let meetingName = req.body.meetingName;
  const meetingId = req.body.meetingId;
  const schoolId = req.body.schoolId;
  const meetingDuration = req.body.duration;
  const modPass = req.body.moderatorPassword;
  const attPass = req.body.attendeePassword;
  let welcomeMessage = req.body.welcome;
  const maxParticipants = req.body.maxParticipants;
  const record = req.body.record;
  let moderatorOnlyMessage = req.body.moderatorOnlyMessage;
  const autoStartRecording = req.body.autoStartRecording;
  const allowStartStopRecording = req.body.allowStartStopRecording;
  const webcamsOnlyForModerator = true;
  const lockSettingsDisableNote = req.body.lockSettingsDisableNote;
  const saleId = req.body.saleId;
  const disabledFeatures = req.body.disabledFeatures;
  const disabledFeaturesExclude = req.body.disabledFeaturesExclude;

  let guest;
  if (req.body.guest === true) {
    guest = "ALWAYS_ACCEPT";
  } else if (req.body.guest === false) {
    guest = "ALWAYS_DENY";
  } else {
    guest = "ASK_MODERATOR";
  }

  try {
    const scalelite = await Scalelite.findOne({
      type: scaleliteType,
      isRemoved: { $ne: true },
    })
      .populate("server")
      .exec();

    // if (!server) {
    //   const error = new Error(ServerNotFoundErrorMsg);
    //   error.httpStatusCode = InternalServerErrorErrorHttpStatusCode;
    //   error.customCode = InternalServerErrorErrorCustomCode;
    //   return next(error);
    // }

    const api = bbb.api(scalelite.server.baseUrl, scalelite.server.secretKey);

    let http = bbb.http;

    meetingName = checksumNormalizationHandler(meetingName);
    welcomeMessage = checksumNormalizationHandler(welcomeMessage);
    moderatorOnlyMessage = checksumNormalizationHandler(moderatorOnlyMessage);
    // let url = server.baseUrl.split("bigbluebutton")[0] + "default2.pdf";
    let meetingCreateUrl = await api.administration.create(
      meetingName,
      meetingId,
      {
        duration: meetingDuration,
        attendeePW: attPass,
        moderatorPW: modPass,
        //guestPolicy: 'ALWAYS_ACCEPT',
        welcome: welcomeMessage,
        //maxParticipants: maxParticipants,
        maxParticipants: 0,
        record: record,
        moderatorOnlyMessage: moderatorOnlyMessage,
        autoStartRecording: autoStartRecording,
        allowStartStopRecording: allowStartStopRecording,
        webcamsOnlyForModerator: webcamsOnlyForModerator,
        lockSettingsDisableNote: lockSettingsDisableNote,
        lockSettingsDisableMic: false,
        allowModsToUnmuteUsers: true,
        muteOnStart: true,
        disabledFeatures,
        disabledFeaturesExclude,
        //disabledFeatures:"presentation",
        //uploadExternalDescription: 'default2.pdf',
        //uploadExternalUrl: server.baseUrl.split('bigbluebutton')[0] + 'default2.pdf',
        //preUploadedPresentationOverrideDefault:false,
        /*lockSettingsDisableCam:false,
            lockSettingsLockOnJoinConfigurable:true,
            lockSettingsLockOnJoin:false,*/
        endWhenNoModeratorDelayInMinutes: 10,
        "userdata-bbb_skip_check_audio_on_first_join": true,
        meta_saleId: saleId,
        meta_schoolId: schoolId,
        meta_serverId: scalelite.server.serverId,
      }
    );

    http(meetingCreateUrl, httpRequestParamData, httpRequestConfig)
      .then((result) => {
        return res
          .status(SuccessfulPostResponseHttpStatusCode)
          .json({ meetingCreateUrl: result });
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(err.message);
        error.httpStatusCode = error.httpStatusCode
          ? error.httpStatusCode
          : InternalServerErrorErrorHttpStatusCode;
        return next(error);
      });
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = error.httpStatusCode
      ? error.httpStatusCode
      : InternalServerErrorErrorHttpStatusCode;
    return next(error);
  }
};

exports.getJoinRoomLink = async (req, res, next) => {
  const scaleliteType = req.body.scaleliteType;
  const meetingId = req.body.meetingId;
  const modPass = req.body.moderatorPassword;
  const attPass = req.body.attendeePassword;
  const fullName = req.body.fullName;
  let status = req.body.status;

  if (typeof status === "undefined") {
    status = false;
  }

  let moderatorUrl;
  let attendeeUrl;

  try {
    const scalelite = await Scalelite.findOne({
      type: scaleliteType,
      isRemoved: { $ne: true },
    })
      .populate("server")
      .exec();

    // if (!server) {
    //   console.log(
    //     "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    //   );
    //   const error = new Error(ServerNotFoundErrorMsg);
    //   error.httpStatusCode = InternalServerErrorErrorHttpStatusCode;
    //   error.customCode = InternalServerErrorErrorCustomCode;
    //   return next(error);
    // }

    const api = bbb.api(scalelite.server.baseUrl, scalelite.server.secretKey);

    let http = bbb.http;

    let meetingInfo = await api.monitoring.getMeetingInfo(meetingId);

    http(meetingInfo, httpRequestParamData, httpRequestConfig)
      .then(async (result) => {
        if (result.returncode !== "SUCCESS") {
          const error = new Error(result.message);
          error.httpStatusCode = InternalServerErrorErrorHttpStatusCode;
          error.customCode = MeetingNotRunningForJoinHttpStatusCode;
          return next(error);
        } else {
          moderatorUrl = await api.administration.join(
            fullName,
            meetingId,
            modPass,
            {
              role: "MODERATOR",
              "userdata-bbb_skip_check_audio_on_first_join": true,
            }
          );

          if (status && result.moderatorCount < 1) {
            attendeeUrl = null;
          } else {
            attendeeUrl = await api.administration.join(
              fullName,
              meetingId,
              attPass,
              {
                role: "VIEWER",
                "userdata-bbb_skip_check_audio_on_first_join": true,
              }
            );
          }
          return res.status(SuccessfulPostResponseHttpStatusCode).json({
            moderatorUrl: moderatorUrl,
            attendeeUrl: attendeeUrl,
          });
        }
      })
      .catch((err) => {
        const error = new Error(err.message);
        error.httpStatusCode = error.httpStatusCode
          ? error.httpStatusCode
          : InternalServerErrorErrorHttpStatusCode;
        error.customCode = ValidationErrorHttpStatusCode;
        return next(error);
      });
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = error.httpStatusCode
      ? error.httpStatusCode
      : InternalServerErrorErrorHttpStatusCode;
    return next(error);
  }
};

exports.getEndRoomLink = async (req, res, next) => {
  const scaleliteType = req.body.scaleliteType;
  const meetingId = req.body.meetingId;
  const modPass = req.body.moderatorPassword;

  try {
    const scalelite = await Scalelite.findOne({
      type: scaleliteType,
      isRemoved: { $ne: true },
    })
      .populate("server")
      .exec();

    // if (!server) {
    //   console.log(
    //     "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    //   );
    //   const error = new Error(ServerNotFoundErrorMsg);
    //   error.httpStatusCode = InternalServerErrorErrorHttpStatusCode;
    //   error.customCode = InternalServerErrorErrorCustomCode;
    //   return next(error);
    // }

    const api = bbb.api(scalelite.server.baseUrl, scalelite.server.secretKey);

    let http = bbb.http;

    let meetingEndUrl = await api.administration.end(meetingId, modPass);

    http(meetingEndUrl, httpRequestParamData, httpRequestConfig)
      .then((result) => {
        return res
          .status(SuccessfulPostResponseHttpStatusCode)
          .json({ meetingEndUrl: result });
      })
      .catch((err) => {
        const error = new Error(err.message);
        error.httpStatusCode = error.httpStatusCode
          ? error.httpStatusCode
          : InternalServerErrorErrorHttpStatusCode;
        error.customCode = ValidationErrorHttpStatusCode;
        return next(error);
      });
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = error.httpStatusCode
      ? error.httpStatusCode
      : InternalServerErrorErrorHttpStatusCode;
    return next(error);
  }
};

exports.findServer = async (req, res, next) => {
  const serverIds = req.body.serverIds;
  let maximumParticipant = 1000;
  let counter = 0;
  let desireServerId;

  try {
    serverIds.forEach(async (id) => {
      const server = await Server.findOne({
        serverId: id,
        setting: true,
        autoSet: true,
        isRemoved: { $ne: true },
      });

      let s = await Server.findOne({ serverId: id });
      console.log("name: " + s.name);
      console.log("setting: " + s.setting);
      console.log("autoSet: " + s.autoSet);
      console.log("isRemoved: " + s.isRemoved);

      console.log();
      if (!server) {
        counter++;
        console.log("check 1");
        if (counter === serverIds.length) {
          return res.status(SuccessfulPostResponseHttpStatusCode).json({
            serverId: desireServerId,
          });
        }
      } else {
        console.log("check 2");

        const api = bbb.api(server.baseUrl, server.secretKey);

        let http = bbb.http;
        let meetings = await api.monitoring.getMeetings();

        let httpRequestConfigForThisOne = {
          headers: {
            Connection: "keep-alive",
            "Keep-Alive": "timeout=10, max=100",
          },
        };
        console.log("check 3");

        http(meetings, httpRequestParamData, httpRequestConfigForThisOne)
          .then((result) => {
            console.log("check 14");
            if (result.returncode === "SUCCESS") {
              console.log("check 5");

              let theMeetings = result.meetings;
              if (theMeetings.length > 0) {
                let totalParticipants = 0;
                let counter2 = 0;
                theMeetings.forEach((meeting) => {
                  totalParticipants += meeting.participantCount;
                  counter2++;
                  if (counter2 === theMeetings.length) {
                    if (totalParticipants <= maximumParticipant) {
                      maximumParticipant = totalParticipants;
                      desireServerId = server.serverId;
                    }
                  }
                });
                counter++;
                if (counter === serverIds.length) {
                  return res.status(SuccessfulPostResponseHttpStatusCode).json({
                    serverId: desireServerId,
                  });
                }
              } else {
                maximumParticipant = 0;
                desireServerId = server.serverId;
                counter++;
                if (counter === serverIds.length) {
                  return res.status(SuccessfulPostResponseHttpStatusCode).json({
                    serverId: desireServerId,
                  });
                }
              }
            } else {
              console.log("check 7");
              counter++;
              if (counter === serverIds.length) {
                return res.status(SuccessfulPostResponseHttpStatusCode).json({
                  serverId: desireServerId,
                });
              }
            }
          })
          .catch(async (err) => {
            const syncDataBaseRequiest = await axios.post(
              process.env.ROOMEET_SERVERS_AUTO_ON_AND_OFF_API_URL,
              {
                token: process.env.ROOMEET_SERVERS_AUTOSET_CAHNGE_API_TOKEN,
                server_id: server.id,
                on: false,
                error: err.message,
              }
            );
            counter++;
            server.autoSet = false;
            server.record = false;
            server.autoRecord = false;
            await server.save();
            if (counter === serverIds.length) {
              return res.status(SuccessfulPostResponseHttpStatusCode).json({
                serverId: desireServerId,
              });
            }
          });
      }
    });
  } catch (err) {
    console.log("findServerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
    console.log(err);
    const error = new Error(err.message);
    error.httpStatusCode = error.httpStatusCode
      ? error.httpStatusCode
      : InternalServerErrorErrorHttpStatusCode;
    return next(error);
  }
};
