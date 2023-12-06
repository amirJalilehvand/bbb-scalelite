require("./util/hardCodedValues");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const vOneRouter = require("./api/v1/v1");

const { validate, tokenValidator } = require("./hooks/validationHandler");
const updateAllServers = require("./hooks/updateAllServers");
const errorHanlder = require("./hooks/errorHanlder");
const serversMonitoringMethod =
  require("./controllers/monitoring").monitorServers;
const serversMonitoringMeetingsParticipantCountBySaleIdMethod =
  require("./controllers/monitoring").monitorMeetingsParticipants;

const app = express();
app.use(bodyParser.json());

app.get("/ww" , serversMonitoringMeetingsParticipantCountBySaleIdMethod)
app.use("/api/v1", tokenValidator(), validate, vOneRouter);

app.use(errorHanlder);

//setInterval(updateAllServers , 120000);

if (process.env.NODE_APP_INSTANCE === "0") {
  setInterval(async () => {
    await serversMonitoringMethod();
    await serversMonitoringMeetingsParticipantCountBySaleIdMethod();
  }, 60000);
}

const MONGODB_URI = `mongodb://localhost:27017/${process.env.MONGO_DB_NAME}`;

mongoose.connect(
  MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("app connected on Port: " + process.env.PORT);
      app.listen(5005);
    }
  }
);
