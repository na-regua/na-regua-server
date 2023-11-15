"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = require("@config/multer/");
const HttpException_1 = require("@core/HttpException/HttpException");
const errorHandler_1 = require("@core/errorHandler/errorHandler");
const index_1 = require("@core/index");
const Files_model_1 = require("./Files.model");
class FilesRepository {
    updateUserAvatar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = res.locals.user;
                const { avatarId } = req.params;
                if (!user) {
                    throw new HttpException_1.HttpException(400, index_1.SYSTEM_ERRORS.USER_NOT_FOUND);
                }
                if (user.avatar._id.toString() !== avatarId) {
                    throw new HttpException_1.HttpException(403, index_1.SYSTEM_ERRORS.FORBIDDEN);
                }
                const { file } = yield (0, multer_1.handleSingleUploadFile)(req, res);
                if (!file) {
                    throw new HttpException_1.HttpException(400, index_1.SYSTEM_ERRORS.FILE_NOT_FOUND);
                }
                const avatarFile = yield Files_model_1.FilesModel.findById(avatarId);
                if (!avatarFile) {
                    throw new HttpException_1.HttpException(400, index_1.SYSTEM_ERRORS.FILE_NOT_FOUND);
                }
                yield avatarFile.updateOne({
                    localPath: file.path,
                    filename: file.filename,
                    url: `uploads/${file.filename}`,
                });
                return res.status(204).json(null);
            }
            catch (error) {
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
    updateBarberAvatar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const barber = res.locals.barber;
                const { avatarId } = req.params;
                if (!avatarId) {
                    throw new HttpException_1.HttpException(400, index_1.SYSTEM_ERRORS.FILE_NOT_FOUND);
                }
                if (barber.avatar._id.toString() !== avatarId) {
                    throw new HttpException_1.HttpException(403, index_1.SYSTEM_ERRORS.FORBIDDEN);
                }
                const { file } = yield (0, multer_1.handleSingleUploadFile)(req, res);
                if (!file) {
                    throw new HttpException_1.HttpException(400, index_1.SYSTEM_ERRORS.FILE_NOT_SENT);
                }
                const avatarFile = yield Files_model_1.FilesModel.findById(avatarId);
                if (!avatarFile) {
                    throw new HttpException_1.HttpException(400, index_1.SYSTEM_ERRORS.FILE_NOT_FOUND);
                }
                yield avatarFile.updateOne({
                    localPath: file.path,
                    filename: file.filename,
                    url: `uploads/${file.filename}`,
                });
                return res.status(204).json(null);
            }
            catch (error) {
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
    uploadFileToStorage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uploadResult = yield (0, multer_1.handleMultipleUploadFile)(req, res);
                const uploadedFiles = uploadResult.files;
                const createdFiles = [];
                const createFilesPromise = new Promise((resolve) => {
                    uploadedFiles.map((uploadedFile) => __awaiter(this, void 0, void 0, function* () {
                        const createdFile = yield Files_model_1.FilesModel.create({
                            filename: uploadedFile.filename,
                            localPath: uploadedFile.path,
                            url: `uploads/${uploadedFile.filename}`,
                        });
                        createdFiles.push(createdFile);
                        if (createdFiles.length === uploadedFiles.length) {
                            resolve();
                        }
                    }));
                });
                yield createFilesPromise;
                return res.status(200).json(createdFiles);
            }
            catch (error) {
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
}
exports.default = new FilesRepository();