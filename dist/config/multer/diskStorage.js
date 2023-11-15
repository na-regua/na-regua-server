"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRemoveFile = exports.handleSingleUploadFile = exports.handleMultipleUploadFile = void 0;
const HttpException_1 = require("@core/HttpException/HttpException");
const index_1 = require("@core/index");
const multer_1 = __importDefault(require("multer"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const uploadFilePath = path.resolve(__dirname, "../../", "public/uploads");
const storageFile = multer_1.default.diskStorage({
    destination: uploadFilePath,
    filename(req, file, fn) {
        fn(null, `${(0, crypto_1.randomUUID)()}${path.extname(file.originalname)}`);
    },
});
const uploadFile = (0, multer_1.default)({
    storage: storageFile,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(req, file, callback) {
        const extension = [".png", ".jpg", ".jpeg"].indexOf(path.extname(file.originalname).toLowerCase()) >= 0;
        const mimeType = ["image/png", "image/jpg", "image/jpeg"].indexOf(file.mimetype) >= 0;
        if (extension && mimeType) {
            return callback(null, true);
        }
        callback(new HttpException_1.HttpException(400, index_1.SYSTEM_ERRORS.INVALID_FILE));
    },
}).single("file");
const handleSingleUploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        uploadFile(req, res, (error) => {
            if (error) {
                reject(error);
            }
            resolve({ file: req.file, body: req.body });
        });
    });
});
exports.handleSingleUploadFile = handleSingleUploadFile;
const uploadFileArray = (0, multer_1.default)({
    storage: storageFile,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(req, file, callback) {
        const extension = [".png", ".jpg", ".jpeg"].indexOf(path.extname(file.originalname).toLowerCase()) >= 0;
        const mimeType = ["image/png", "image/jpg", "image/jpeg"].indexOf(file.mimetype) >= 0;
        if (extension && mimeType) {
            return callback(null, true);
        }
        callback(new HttpException_1.HttpException(400, index_1.SYSTEM_ERRORS.INVALID_FILE));
    },
}).array("files");
const handleMultipleUploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        uploadFileArray(req, res, (error) => {
            if (error) {
                reject(error);
            }
            resolve({ files: req.files, body: req.body });
        });
    });
});
exports.handleMultipleUploadFile = handleMultipleUploadFile;
const fs = require("fs");
const { promisify } = require("util");
const handleRemoveFile = promisify(fs.unlink);
exports.handleRemoveFile = handleRemoveFile;
