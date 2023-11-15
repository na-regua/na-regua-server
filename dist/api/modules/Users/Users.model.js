"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModel = void 0;
const mongoose_1 = require("mongoose");
const Users_schema_1 = require("./Users.schema");
const UsersModel = (0, mongoose_1.model)("Users", Users_schema_1.UsersSchema);
exports.UsersModel = UsersModel;
