const express = require("express");
const https = require("https");
const icy = require("icy");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

// Load config.json file
const configPath = path.join(__dirname, "config.json");
let streamUrl, admin;
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  streamUrl = config.streamUrl;
  admin = config.admin;
} catch (err) {
  console.error("Error reading config.json:", err);
  process.exit(1);
}

const port = 3000;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/modify", (req, res) => {
  res.sendFile(path.join(__dirname, "modify.html"));
});

// Serve audio stream
app.get("/stream", (req, res) => {
  https
    .get(streamUrl, (streamRes) => {
      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      streamRes.pipe(res);
    })
    .on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).send("Failed to fetch stream.");
    });
});

// Get metadata
app.get("/metadata", (req, res) => {
  icy.get(streamUrl, (res1) => {
    res1.on("metadata", (metadata) => {
      const parsed = icy.parse(metadata);
      res.json(parsed);
    });
  });
});

// Modify stream URL
app.post("/modify_stream", (req, res) => {
  const { id, pwd, newStreamUrl } = req.body;

  // Validate ID and password
  if (id === admin.id && pwd === admin.password) {
    streamUrl = newStreamUrl;

    // Update config.json
    config.streamUrl = newStreamUrl;
    fs.writeFile(configPath, JSON.stringify(config), (err) => {
      if (err) {
        console.error("Error updating config.json:", err);
      }
    });

    res.send("Stream URL updated successfully.");
  } else {
    res.status(403).send("Invalid ID or password.");
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
