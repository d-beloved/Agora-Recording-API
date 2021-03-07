const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
require("dotenv").config();

app.get("/", (req, res) => res.send("Agora Cloud Recording Server"));

// Authorization header
const Authorization = `Basic ${Buffer.from(
  `${process.env.CUSTOMERID}:${process.env.CUSTOMER_SECRET}`
).toString("base64")}`;
// acquire the resourceId
app.post("/acquire", async (req, res) => {
  try {
    const acquire = await axios.post(
      `https://api.agora.io/v1/apps/${process.env.appID}/cloud_recording/acquire`,
      {
        cname: req.body.channel,
        uid: req.body.uid,
        clientRequest: {
          resourceExpiredHour: 24,
        },
      },
      { headers: { Authorization } }
    );
    return res.send(acquire.data);
  } catch (error) {
    console.log(error.response);
  }
});

// Start recording
app.post("/start", async (req, res) => {
  const appID = process.env.appID;
  const resource = req.body.resource;
  const mode = req.body.mode;
  try {
    const start = await axios.post(
      `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/mode/${mode}/start`,
      {
        cname: req.body.channel,
        uid: req.body.uid,
        clientRequest: {
          recordingConfig: {
            maxIdleTime: 30,
            streamTypes: 2,
            channelType: 0,
            videoStreamType: 0,
            transcodingConfig: {
              height: 640,
              width: 360,
              bitrate: 500,
              fps: 15,
              mixedVideoLayout: 1,
              backgroundColor: "#FFFFFF",
            },
          },
          recordingFileConfig: {
            avFileType: ["hls"],
          },
          storageConfig: {
            vendor: 1,
            region: 3,
            bucket: process.env.bucket,
            accessKey: process.env.accessKey,
            secretKey: process.env.secretKey,
            fileNamePrefix: ["directory1", "directory2"],
          },
        },
      },
      { headers: { Authorization } }
    );

    return res.send(start.data);
  } catch (error) {
    console.log(error.response);
  }
});

// stop recording
app.post("/stop", async (req, res) => {
  const appID = process.env.appID;
  const resource = req.body.resource;
  const sid = req.body.sid;
  const mode = req.body.mode;
  try {
    const stop = await axios.post(
      `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/stop`,
      {
        cname: req.body.channel,
        uid: req.body.uid,
        clientRequest: {},
      },
      { headers: { Authorization } }
    );
    return res.send(stop.data);
  } catch(error) {
    console.log(error.response);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Agora Cloud Recording Server listening at Port ${port}`)
);
