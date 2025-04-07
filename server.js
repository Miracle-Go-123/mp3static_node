const http = require("http");
const https = require("https");
const icy = require("icy");
const fs = require("fs");
const path = require("path");

const streamUrl =
  "https://azura.eternityready.com/listen/eternity_ready_radio/radio.mp3";
const port = 3000;

// Serve HTML and audio stream
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    const filePath = path.join(__dirname, "index.html");
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Failed to load index.html");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  } else if (req.url === "/stream") {
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
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Failed to fetch stream.");
      });
  } else if (req.url === "/metadata") {
    icy.get(streamUrl, (res1) => {
      res1.on("metadata", (metadata) => {
        const parsed = icy.parse(metadata);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(parsed));
      });
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

// Start server
server.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
