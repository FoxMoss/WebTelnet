import { init, routeRequest, routeUpgrade, shouldRoute } from "wisp-server-cpp";
import http from "node:http";
import express from "express";

init();

const app = express();
const server = http.createServer();

server.on("request", (request, response) => {
  if (shouldRoute(request)) {
    response.setHeader;
    routeRequest(request, response);
    return;
  }
  app(request, response);
});
server.on("upgrade", (request, socket, head) => {
  if (shouldRoute(request)) {
    routeUpgrade(request, socket, head);
    return;
  }
});

app.use(express.static("dist/"));

server.listen(6001);
console.log("Running on port 6001");
