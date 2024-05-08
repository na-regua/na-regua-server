require("dotenv").config();
import { Server, SocketServer } from "./core";

const PORT = process.env.PORT || 8080;
const server = new Server();

const serverInstance = server.listen(PORT);

const GlobalSocket = new SocketServer(serverInstance);

GlobalSocket.start();

export { GlobalSocket };
