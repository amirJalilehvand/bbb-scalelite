const bbb = require("bigbluebutton-js");
const Server = require("../models/server.js");
const ServerMess = require("../models/serverMess.js");
const Scalelite = require("../models/scalelite.js");
const axios = require("axios");

let httpRequestConfig = {
  headers: {
    Connection: "keep-alive",
    "Keep-Alive": "timeout=60, max=100",
  },
};

let httpRequestParamData = {};

exports.getIsMeetingRunning = async (req, res, next) => {
  const scaleliteType = req.body.scaleliteType;
  const meetingId = req.body.meetingId;
  let data = {
    isMeetingRunning: {
      returncode: "FAILED",
      running: false,
    },
  };

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
    let isMeetingRunning = await api.monitoring.isMeetingRunning(meetingId);

    http(isMeetingRunning, httpRequestParamData, httpRequestConfig)
      .then((result) => {
        return res
          .status(SuccessfulPostResponseHttpStatusCode)
          .json({ isMeetingRunning: result });
      })
      .catch((err) => {
        return res
          .status(SuccessfulPostResponseHttpStatusCode)
          .json({ isMeetingRunning: data });
      });
  } catch (err) {
    return res
      .status(SuccessfulPostResponseHttpStatusCode)
      .json({ isMeetingRunning: data });
  }
};

exports.getMeetingInfo = async (req, res, next) => {
  const scaleliteType = req.body.scaleliteType;
  const meetingId = req.body.meetingId;

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
      .then((result) => {
        return res
          .status(SuccessfulPostResponseHttpStatusCode)
          .json({ meetingInfo: result });
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

exports.getMeetings = async (req, res, next) => {
  const scaleliteType = req.body.scaleliteType;
  let data = {
    meetings: {
      returncode: "SUCCESS",
      meetings: [],
      messageKey: "noMeetings",
      message: "no meetings were found on this server",
    },
  };

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
    let meetings = await api.monitoring.getMeetings();

    http(meetings, httpRequestParamData, httpRequestConfig)
      .then((result) => {
        return res
          .status(SuccessfulPostResponseHttpStatusCode)
          .json({ meetings: result });
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

exports.getMeetingsRunning = async (req, res, next) => {
  const userMeetings = req.body.usersMeetings;
  const schoolId = req.body.schoolId;
  const scaleliteType = req.body.scaleliteType;
  let onlineMeetings = [];
  let allMeetings = [];

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

    let meetingsInfo = await api.monitoring.getMeetings();

    const result = await http(
      meetingsInfo,
      httpRequestParamData,
      httpRequestConfig
    );

    if (result) {
      allMeetings = result.meetings.length ? result.meetings : [];
      if (userMeetings) {
        for (let item of userMeetings) {
          const meetingIndex = result.meetings.findIndex(
            (element) => element.meetingID === item
          );

          if (meetingIndex > -1) {
            onlineMeetings.push(result.meetings[meetingIndex]);
          }
        }
      } else if (schoolId) {
        onlineMeetings = allMeetings.filter(
          (item) => item.metadata.schoolid === schoolId
        );
      }
    }

    return res.status(SuccessfulPostResponseHttpStatusCode).json({
      onlineMeetings,
    });
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = error.httpStatusCode
      ? error.httpStatusCode
      : InternalServerErrorErrorHttpStatusCode;
    return next(error);
  }
};

exports.getAllMeetingsRunning = async (req, res, next) => {
  let allMeetings = [];
  let activeServers = [];

  try {
    const servers = await Server.find({
      setting: true,
      //autoSet: true,
      serverType: { $ne: "scalelite" },
      isRemoved: { $ne: true },
    });

    if (servers.length < 1) {
      console.log(
        "ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
      );

      const error = new Error(ServerNotFoundErrorMsg);
      error.httpStatusCode = InternalServerErrorErrorHttpStatusCode;
      return next(error);
    }

    for (let server of servers) {
      try {
        const api = bbb.api(server.baseUrl, server.secretKey);

        let http = bbb.http;

        let meetingsInfo = await api.monitoring.getMeetings();

        const result = await http(
          meetingsInfo,
          httpRequestParamData,
          httpRequestConfig
        );

        let meetings = [];
        if (result) {
          server.autoSet = true;
          await server.save();
          meetings = result.meetings ? [...result.meetings] : [];
        }

        activeServers.push({
          serverId: server.serverId,
          meetings,
        });

        if (meetings.length > 0) {
          allMeetings.push(...meetings);
        }
      } catch (err) {
        server.autoSet = false;
        await server.save();
        continue;
      }
    }

    return res.status(SuccessfulPostResponseHttpStatusCode).json({
      onlineMeetings: allMeetings,
      activeServers,
    });
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = error.httpStatusCode
      ? error.httpStatusCode
      : InternalServerErrorErrorHttpStatusCode;
    return next(error);
  }
};

exports.monitorServers = async () => {
  const servers = await Server.find({ setting: true, isRemoved: false });

  for (let server of servers) {
    console.log("server: " + server.name + "\t" + server.autoSet);
    try {
      const api = bbb.api(server.baseUrl, server.secretKey);

      let http = bbb.http;

      let meetingsInfo = await api.monitoring.getMeetings();

      const result = await http(
        meetingsInfo,
        httpRequestParamData,
        httpRequestConfig
      );
      if (result) {
        if (result.returncode !== "SUCCESS") {
          server.autoRecord = false;
          server.record = false;
          server.autoSet = false;
          const savedServer = await server.save();
          console.log("*****************************************");
          console.log("server " + server.name + " is working shitty");
          console.log("*****************************************");
          const syncDataBaseRequiest = await axios.post(
            process.env.ROOMEET_SERVERS_AUTO_ON_AND_OFF_API_URL,
            {
              token: process.env.ROOMEET_SERVERS_AUTOSET_CAHNGE_API_TOKEN,
              server_id: server.serverId,
              on: false,
            }
          );
        } else {
          server.autoRecord = true;
          server.record = true;
          server.autoSet = true;
          const savedServer = await server.save();
          const syncDataBaseRequiest = await axios.post(
            process.env.ROOMEET_SERVERS_AUTO_ON_AND_OFF_API_URL,
            {
              token: process.env.ROOMEET_SERVERS_AUTOSET_CAHNGE_API_TOKEN,
              server_id: server.serverId,
              on: true,
            }
          );
        }
      } else {
        console.log("not working : \t" + server.name);
        server.autoRecord = false;
        server.record = false;
        server.autoSet = false;
        const savedServer = await server.save();
        console.log("__________________________________________________");
        console.log("server " + server.name + " is working shitty");
        console.log("__________________________________________________");
        const syncDataBaseRequiest = await axios.post(
          process.env.ROOMEET_SERVERS_AUTO_ON_AND_OFF_API_URL,
          {
            token: process.env.ROOMEET_SERVERS_AUTOSET_CAHNGE_API_TOKEN,
            server_id: server.serverId,
            on: false,
          }
        );
      }
    } catch (err) {
      try {
        console.log("err:\t" + err);
        console.log("server:\t" + server.serverId);
        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
        console.log("server " + server.name + " is working shitty");
        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
        await loadBalanace(err, server.serverId);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("server " + server.name + " is working shitty");
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      } catch (error) {
        console.log(error);
      }
    }
  }
};

// exports.monitorMeetingsParticipants = async () => {
//   let array = [];
//   let counter1 = 0;
//   let counter2 = 0;

//   let httpRequestConfigForThisOne = {
//     headers: {
//       Connection: "keep-alive",
//       "Keep-Alive": "timeout=10, max=100",
//     },
//   };

//   try {
//     const servers = await Server.find({
//       setting: true,
//       autoSet: true,
//       isRemoved: false,
//     });

//     servers.forEach(async (server) => {
//       const api = bbb.api(server.baseUrl, server.secretKey);

//       let http = bbb.http;

//       let meetingsInfo = await api.monitoring.getMeetings();

//       const result = await http(
//         meetingsInfo,
//         httpRequestParamData,
//         httpRequestConfigForThisOne
//       );
//       if (!result) {
//         counter1++;
//         if (counter1 === servers.length) {
//           return axios.post(
//             process.env.ROOMEET_MONITOR_MEETINGS_PARTICIPANTS_COUNTS_BY_SALEID,
//             {
//               token: process.env.THE_TOKEN,
//               responseData: array,
//             }
//           );
//         }
//       } else {
//         if (result.returncode !== "SUCCESS") {
//           counter1++;
//           if (counter1 === servers.length) {
//             return axios.post(
//               process.env
//                 .ROOMEET_MONITOR_MEETINGS_PARTICIPANTS_COUNTS_BY_SALEID,
//               {
//                 token: process.env.THE_TOKEN,
//                 responseData: array,
//               }
//             );
//           }
//         } else {
//           const meetings = result.meetings;
//           if (meetings.length < 1) {
//             counter1++;
//             if (counter1 === servers.length) {
//               return axios.post(
//                 process.env
//                   .ROOMEET_MONITOR_MEETINGS_PARTICIPANTS_COUNTS_BY_SALEID,
//                 {
//                   token: process.env.THE_TOKEN,
//                   responseData: array,
//                 }
//               );
//             }
//           } else {
//             meetings.forEach(async (meeting) => {
//               if (!meeting.metadata.saleid) {
//                 counter2++;
//                 if (counter2 === meetings.length) {
//                   counter1++;
//                   if (counter1 === servers.length) {
//                     return axios.post(
//                       process.env
//                         .ROOMEET_MONITOR_MEETINGS_PARTICIPANTS_COUNTS_BY_SALEID,
//                       {
//                         token: process.env.THE_TOKEN,
//                         responseData: array,
//                       }
//                     );
//                   }
//                 }
//               } else {
//                 array.push({
//                   saleId: meeting.metadata.saleid,
//                   meetingId: meeting.meetingID,
//                   participantCount: meeting.participantCount,
//                   webcamCount: meeting.videoCount,
//                 });
//                 counter2++;
//                 if (counter2 === meetings.length) {
//                   counter1++;
//                   if (counter1 === servers.length) {
//                     return axios.post(
//                       process.env
//                         .ROOMEET_MONITOR_MEETINGS_PARTICIPANTS_COUNTS_BY_SALEID,
//                       {
//                         token: process.env.THE_TOKEN,
//                         responseData: array,
//                       }
//                     );
//                   }
//                 }
//               }
//             });
//           }
//           counter1++;
//           if (counter1 === servers.length) {
//             return axios.post(
//               process.env
//                 .ROOMEET_MONITOR_MEETINGS_PARTICIPANTS_COUNTS_BY_SALEID,
//               {
//                 token: process.env.THE_TOKEN,
//                 responseData: array,
//               }
//             );
//           }
//         }
//       }
//     });
//   } catch (err) {
//     //console.log(err);
//   }
// };

exports.monitorMeetingsParticipants = async (req, res, next) => {
  let array = [];

  let httpRequestConfigForThisOne = {
    headers: {
      Connection: "keep-alive",
      "Keep-Alive": "timeout=10, max=100",
    },
  };

  try {
    const scalelites = await Scalelite.find({
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


    for (let scalelite of scalelites) {
      try {
        const api = bbb.api(scalelite.server.baseUrl, scalelite.server.secretKey);

        let http = bbb.http;

        let meetingsInfo = await api.monitoring.getMeetings();

        const result = await http(
          meetingsInfo,
          httpRequestParamData,
          httpRequestConfigForThisOne
        );

        if (result.returncode === "SUCCESS") {
          const meetings = result.meetings;
          for (let meeting of meetings) {
            let itemIndex = array.findIndex(
              (element) => element.saleId === meeting.metadata.saleid
            );

            if (itemIndex < 0) {
              array.push({
                saleId: meeting.metadata.saleid,
                meetings: [
                  {
                    meetingId: meeting.meetingID,
                    serverId: meeting.metadata.serverid,
                    webcamCount: meeting.videoCount,
                    participantCount: meeting.participantCount,
                  },
                ],
                participantCount: meeting.participantCount,
                webcamCount: meeting.videoCount,
              });
            } else {
              array[itemIndex].meetings.push({
                meetingId: meeting.meetingID,
                serverId: meeting.metadata.serverid,
                webcamCount: meeting.videoCount,
                participantCount: meeting.participantCount,
              });
              array[itemIndex].participantCount += meeting.participantCount;
              array[itemIndex].webcamCount += meeting.videoCount;
            }
          }
        }
      } catch (err) {
        console.log("inner for: " + err);
      }
    }

    // return res.status(200).json({
    //   responseData: array,
    // });
    return axios.post(
      process.env.ROOMEET_MONITOR_MEETINGS_PARTICIPANTS_COUNTS_BY_SALEID,
      {
        token: process.env.THE_TOKEN,
        responseData: array,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

const loadBalanace = async (err, serverId) => {
  let server = await Server.findOne({
    serverId: serverId,
    isRemoved: { $ne: true },
  });

  console.log("\n\n\n\n\n\n\n\n\n\n\n");
  console.log(server.name + " : \t" + err.code);
  console.log(err);
  console.log("\n\n\n\n\n\n\n\n\n\n\n");

  const messageStringsArray = err.message.split(" ");
  const isTimeOutError = err.code === "ETIMEDOUT";
  const isEAI_AGAINError = err.code === "EAI_AGAIN";
  const isNotFoundError =
    messageStringsArray.indexOf("ENOTFOUND") > -1 ? true : false;
  const isEHOSTUNREACHError =
    messageStringsArray.indexOf("EHOSTUNREACH") > -1 ? true : false;
  const isECONNREFUSEDError =
    messageStringsArray.indexOf("ECONNREFUSED") > -1 ? true : false;
  const isERR_TLS_CERT_ALTNAME_INVALIDError =
    messageStringsArray.indexOf("ERR_TLS_CERT_ALTNAME_INVALID") > -1
      ? true
      : false;
  console.log(isERR_TLS_CERT_ALTNAME_INVALIDError);
  if (
    isTimeOutError ||
    isEAI_AGAINError ||
    isNotFoundError ||
    isEHOSTUNREACHError ||
    isECONNREFUSEDError ||
    isERR_TLS_CERT_ALTNAME_INVALIDError
  ) {
    try {
      console.log("off : " + server.serverId);
      server.autoRecord = false;
      server.record = false;
      server.autoSet = false;
      await server.save();
      await sendTurnOffServerRequest(server, err);
    } catch (err) {
      console.log("inner LoadBalance error:\n" + err);
    }
  } else {
    console.log("new type of error:\n");
    console.log(err);
    try {
      let newServerMess = new ServerMess({
        serverId: server._id,
        errorCode: err.code,
        errorMessage: err.message,
      });
      await newServerMess;
      server.autoRecord = false;
      server.record = false;
      server.autoSet = false;
      await server.save();
      await sendTurnOffServerRequest(server, err);
    } catch (error) {
      console.log("new type of error catch block:\n" + error);
    }
  }
};

exports.getMeetingsRunningParticipantsCount = async (req, res, next) => {
  const scaleliteType = req.body.scaleliteType;
  const userMeetings = req.body.userMeetings;
  let count = 0;

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

    for (let item of userMeetings) {
      let meetingInfo = await api.monitoring.getMeetingInfo(item.meetingId);

      let result;

      result = await http(meetingInfo, httpRequestParamData, httpRequestConfig);

      if (result.returncode === "SUCCESS") {
        count += result.participantCount;
      }
    }

    return res.status(SuccessfulPostResponseHttpStatusCode).json({
      count,
    });
  } catch (err) {
    console.log("PcOOOOOOOOOOOOOOOOOOOOOOOOOunt catchhhhhhhhh");
    console.log(err);
    const error = new Error(err.message);
    error.httpStatusCode = error.httpStatusCode
      ? error.httpStatusCode
      : InternalServerErrorErrorHttpStatusCode;
    return next(error);
  }
};

const sendTurnOffServerRequest = async (server, err) => {
  try {
    const syncDataBaseRequiest = await axios.post(
      process.env.ROOMEET_SERVERS_AUTO_ON_AND_OFF_API_URL,
      {
        token: process.env.ROOMEET_SERVERS_AUTOSET_CAHNGE_API_TOKEN,
        server_id: server.serverId,
        on: false,
        error: err.message,
      }
    );
  } catch (error) {
    let newServerMess = new ServerMess({
      server: server._id,
      errorCode: err.code,
      errorMessage: error.message,
    });
    await newServerMess;
  }
};
