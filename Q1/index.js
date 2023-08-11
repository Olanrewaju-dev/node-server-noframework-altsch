const http = require("http");
const fs = require("fs");
const path = require("path");

const htmlFile = path.join(__dirname, "static", "index.html");

const PORT = 3000;
const HOST_NAME = "localhost";

const requestHandler = (req, res) => {
  res.setHeader("Content-Type", "text/html"); // setting web server headers
  // handling GET request to /index.html
  if (req.url === "/index.html") {
    fs.readFile(htmlFile, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.write("Internal Server Error");
      }

      res.writeHead(200);
      res.end(data);
    });
  } else {
    // handling error when users navigate to unsupported route
    res.writeHead(404);
    res.end("Page Not Found.");
  }
};

// server declaration using http
const server = http.createServer(requestHandler);

// setting server ports and hostname
server.listen(PORT, HOST_NAME, () => {
  console.log(`Server is listening on ${HOST_NAME}:${PORT}`);
});
