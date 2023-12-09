const bbb = require("bigbluebutton-js");
const Server = require("../models/server.js");
const Scalelite = require("../models/scalelite.js");

exports.getRecordings = async (req, res, next) => {
  const serverId = req.body.serverId;

  try {
    const server = await Server.findOne({
      serverId: serverId,
      setting: true,
      autoSet: true,
      isRemoved: { $ne: true },
    });
    if (!server) {
      const error = new Error(ServerNotFoundErrorMsg);
      error.httpStatusCode = InternalServerErrorErrorHttpStatusCode;
      return next(error);
    }

    const api = bbb.api(server.baseUrl, server.secretKey);

    let http = bbb.http;
    let recordings = await api.recording.getRecordings();

    http(recordings)
      .then((result) => {
        return res
          .status(SuccessfulPostResponseHttpStatusCode)
          .json({ recordings: result });
      })
      .catch((err) => {
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

exports.publishRecordings = async (req, res, next) => {
  const scaleliteType = req.body.scaleliteType;
  const recordId = req.body.recordId;
  const publish = req.body.publish;

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
    let publishRecordings = await api.recording.publishRecordings(
      recordId,
      publish
    );

    http(publishRecordings)
      .then((result) => {
        return res
          .status(SuccessfulPostResponseHttpStatusCode)
          .json({ publishRecordings: result });
      })
      .catch((err) => {
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

exports.deleteRecording = async (req, res, next) => {
  const scaleliteType = req.body.scaleliteType;
  const recordId = req.body.recordId;

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
    let deleteRecording = await api.recording.deleteRecordings(recordId);

    http(deleteRecording)
      .then((result) => {
        return res
          .status(SuccessfulPostResponseHttpStatusCode)
          .json({ deleteRecording: result });
      })
      .catch((err) => {
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

exports.getRecordingTextTracks = async (req, res, next) => {
  const serverId = req.body.serverId;
  const recordId = req.body.recordId;

  try {
    const server = await Server.findOne({
      serverId: serverId,
      setting: true,
      isRemoved: { $ne: true },
    });
    if (!server) {
      const error = new Error(ServerNotFoundErrorMsg);
      error.httpStatusCode = InternalServerErrorErrorHttpStatusCode;
      return next(error);
    }

    const api = bbb.api(server.baseUrl, server.secretKey);

    let http = bbb.http;
    let theRecording = await api.recording.getRecordingTextTracks(recordId);

    http(theRecording)
      .then((result) => {
        return res
          .status(SuccessfulPostResponseHttpStatusCode)
          .json({ theRecordingTextTracks: result });
      })
      .catch((err) => {
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

exports.getRecordingsByMeetingId = async (req, res, next) => {
  const meetingId = req.body.meetingId;
  const allowDownloadRecordings = req.body.allowDownloadRecordings;
  let finalAnswer = [];

  try {
    const scalelites = await Scalelite.find({
      isRemoved: { $ne: true },
    })
      .populate("server")
      .exec();

    for (let scalelite of scalelites) {
      const api = bbb.api(scalelite.server.baseUrl, scalelite.server.secretKey);
      let http = bbb.http;
      try {
        let recordings = await api.recording.getRecordings({
          meetingID: meetingId,
        });

        const result = await http(recordings);

        let temp = [...result.recordings];
        if (scalelite.type === "dedicated" && allowDownloadRecordings) {
          for (let item of temp) {
            item.downloadLink = `${
              scalelite.server.baseUrl.split("bigbluebutton")[0]
            }playback/video/${item.recordID}/video-0.m4v`;
          }
        }
        temp.forEach((item) => {});
        finalAnswer.push(...temp);
      } catch (err) {
        console.log(err);
      }
    }

    finalAnswer.sort(function (x, y) {
      return y.endTime - x.endTime;
    });

    return res
      .status(SuccessfulPostResponseHttpStatusCode)
      .json({ recordings: finalAnswer });
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = error.httpStatusCode
      ? error.httpStatusCode
      : InternalServerErrorErrorHttpStatusCode;
    return next(error);
  }
};
