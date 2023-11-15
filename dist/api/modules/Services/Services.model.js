"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesModel = void 0;
const mongoose_1 = require("mongoose");
const Services_schema_1 = require("./Services.schema");
const ServicesModel = (0, mongoose_1.model)("Services", Services_schema_1.ServicesSchema);
exports.ServicesModel = ServicesModel;
