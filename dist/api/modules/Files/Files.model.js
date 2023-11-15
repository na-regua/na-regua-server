"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesSchema = exports.FilesModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const FilesSchema = new mongoose_2.Schema({
    filename: {
        type: String,
        required: true,
        unique: true,
    },
    localPath: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
}, {
    versionKey: false,
    timestamps: false,
    collection: "Files",
});
exports.FilesSchema = FilesSchema;
const FilesModel = (0, mongoose_1.model)("Files", FilesSchema);
exports.FilesModel = FilesModel;
