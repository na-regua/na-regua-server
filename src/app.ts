require("dotenv").config();
import { Server } from "./core";

const PORT = process.env.PORT || 8080;
const server = new Server();

server.listen(PORT);