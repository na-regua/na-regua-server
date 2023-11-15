"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkersModel = void 0;
const mongoose_1 = require("mongoose");
const Workers_schema_1 = require("./Workers.schema");
const WorkersModel = (0, mongoose_1.model)("Workers", Workers_schema_1.WorkersSchema);
exports.WorkersModel = WorkersModel;
