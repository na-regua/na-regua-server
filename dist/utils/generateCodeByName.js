"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeByName = void 0;
function generateCodeByName() {
    return Math.floor(Math.random() * 167772151212)
        .toString(16)
        .toLocaleUpperCase();
}
exports.generateCodeByName = generateCodeByName;
