"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = void 0;
const SystemErrors_1 = require("@core/SystemErrors/SystemErrors");
class HttpException extends Error {
    constructor(status, message) {
        if (SystemErrors_1.SYSTEM_ERRORS[message]) {
            message = SystemErrors_1.SYSTEM_ERRORS[message];
        }
        super(message);
        this.status = status;
        this.message = message;
    }
}
exports.HttpException = HttpException;
