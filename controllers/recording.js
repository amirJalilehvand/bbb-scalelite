const bbb = require("bigbluebutton-js");
const Server = require("../models/server.js");

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
  const serverId = req.body.serverId;
  const recordId = req.body.recordId;
  const publish = req.body.publish;

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
  const serverId = req.body.serverId;
  const recordId = req.body.recordId;

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
  let counter = 0;

  try {
    const servers = await Server.find({
      setting: true,
      record: true,
      serverType:"scalelite",
      //$or: [{ serverType: "scalelite" }, { serverId: 318 }, { serverId: 319 }],
      isRemoved: { $ne: true },
    });

    if (servers.length === 0) {
      return res
        .status(SuccessfulPostResponseHttpStatusCode)
        .json({ recordings: finalAnswer });
    }

    servers.forEach(async (server) => {
      const api = bbb.api(server.baseUrl, server.secretKey);

      let http = bbb.http;
      try {
        let recordings = await api.recording.getRecordings({
          meetingID: meetingId,
        });

        const result = await http(recordings);

        if (result.returncode === "SUCCESS") {
          //console.log(answer)\
          let temp = [...result.recordings];
          temp.forEach((item) => {
            item.serverId = server.serverId;
            // if (allowDownloadRecordings) {
            //   if (item.serverId === 313) {
            //     item.downloadLink = `https://live110.roomeet.ir/recording/${item.recordID}.m4v`;
            //   } else if (item.metadata.serverid === 312) {
            //     item.downloadLink = `https://live119.roomeet.ir/recording/${item.recordID}.m4v`;
            //   } else if (item.metadata.serverid === 318) {
            //     item.downloadLink = `https://live118.roomeet.ir/recording/${item.recordID}.m4v`;
            //   } else if (item.metadata.serverid === 319) {
            //     item.downloadLink = `https://live120.roomeet.ir/recording/${item.recordID}.m4v`;
            //   } else {
            //     if (item.metadata.serverid === 317) {
            //       item.downloadLink = `https://live119.roomeet.ir/recording/${item.recordID}.m4v`;
            //     } else if (item.serverId === 317) {
            //       item.downloadLink = `https://live119.roomeet.ir/recording/${item.recordID}.m4v`;
            //     }
            //   }
            // }
            if (allowDownloadRecordings) {
              if (item.serverId === 313) {
                item.downloadLink = `https://playback.liveamooz.com/playback/video/${item.recordID}/video-0.m4v`;
              } else if (item.metadata.serverid === 312) {
                item.downloadLink = `https://vippback.roomeet.ir/playback/video/${item.recordID}/video-0.m4v`;
              } else if (item.metadata.serverid === 318) {
                item.downloadLink = `https://vippback.roomeet.ir/playback/video/${item.recordID}/video-0.m4v`;
              } else if (item.metadata.serverid === 319) {
                item.downloadLink = `https://vippback.roomeet.ir/playback/video/${item.recordID}/video-0.m4v`;
              } else {
                if (item.metadata.serverid === 317) {
                  item.downloadLink = `https://vippback.roomeet.ir/playback/video/${item.recordID}/video-0.m4v`;
                } else if (item.serverId === 317) {
                  item.downloadLink = `https://vippback.roomeet.ir/playback/video/${item.recordID}/video-0.m4v`;
                }
              }
            }
          });
          finalAnswer.push(...temp);
          counter++;
        } else {
          counter++;
        }

        if (counter === servers.length) {
          finalAnswer.sort(function (x, y) {
            return y.endTime - x.endTime;
          });

          return res
            .status(SuccessfulPostResponseHttpStatusCode)
            .json({ recordings: finalAnswer });
        }
      } catch (err) {
        if (err.code === "ETIMEDOUT") {
          server.record = false;
          await server.save();
        }
        counter++;
        if (counter === servers.length) {
          return res
            .status(SuccessfulPostResponseHttpStatusCode)
            .json({ recordings: finalAnswer });
        }
      }
    });
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = error.httpStatusCode
      ? error.httpStatusCode
      : InternalServerErrorErrorHttpStatusCode;
    return next(error);
  }
};
