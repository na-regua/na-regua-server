"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const express_1 = require("express");
class BaseController {
    constructor() {
        this.router = (0, express_1.Router)();
    }
}
exports.BaseController = BaseController;
