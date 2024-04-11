require("dotenv").config();
import { Server, SocketServer } from "./core";

const PORT = process.env.PORT || 8080;
const server = new Server();

const serverInstance = server.listen(PORT);

const socket = new SocketServer(serverInstance);

socket.start();

export { socket };
