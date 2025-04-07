const http = require("http");
const https = require("https");
const icy = require("icy");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");

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
  } else if (req.url === "/modify") {
    const filePath = path.join(__dirname, "modify.html");
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Failed to load modify.html");
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
  } else if (req.url === "/modify_stream" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const postData = querystring.parse(body);
      const { id, pwd, newStreamUrl } = postData;

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

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Stream URL updated successfully.");
      } else {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Invalid ID or password.");
      }
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
