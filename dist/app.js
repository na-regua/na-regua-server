"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const core_1 = require("./core");
const PORT = process.env.PORT || 8080;
const server = new core_1.Server();
server.listen(PORT);
