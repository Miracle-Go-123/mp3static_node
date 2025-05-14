const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const Config = require("../config");
const icy = require("icy");

router.get("/", async (req, res) => {
  try {
    const config = await Config.load();
    if (!config.streamUrl) {
      return res.status(404).json({
        result: false,
        message: "Stream URL not found.",
      });
    }

    // Set headers
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    icy.get(config.streamUrl, function (response) {
      response.on("metadata", (metadata) => {
        var parsed = icy.parse(metadata);
      });

      // Pipe the response directly to the client
      response.pipe(res);

      // Handle client disconnect
      req.on("close", () => {
        response.destroy();
      });
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: error.message,
    });
  }
});

module.exports = router;
