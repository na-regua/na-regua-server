"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const HttpException_1 = require("../HttpException/HttpException");
const __1 = require("..");
function errorHandler(err, res) {
    if (err instanceof HttpException_1.HttpException) {
        console.log(`**ERROR**: [${err.status}] : ${err.message}`);
        return res.status(err.status).json({ message: err.message });
    }
    console.log(`**ERROR**: ${err.message}`);
    const message = err.message;
    if (message && message.includes("Invalid parameter `To`")) {
        return res
            .status(400)
            .json({ message: __1.SYSTEM_ERRORS.INVALID_PHONE_NUMBER });
    }
    return res.status(400).json({ message: err.message });
}
exports.errorHandler = errorHandler;
