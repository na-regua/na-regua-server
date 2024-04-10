require("dotenv").config();
import { Server, SocketServer } from "./core";

const PORT = process.env.PORT || 8080;
const server = new Server();
const socket = new SocketServer(server.app);

socket.start();

server.listen(PORT);

export { socket };
