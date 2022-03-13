const http = require("http");
require("dotenv").config();

const app = require("./app");
const { mongoConnect } = require("./utils/mongo");
const SocketServer = require("./socketServer");
const io = require("socket.io")(http);

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  io.on("connection", (socket) => {
    SocketServer(socket);
  });
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

startServer();
