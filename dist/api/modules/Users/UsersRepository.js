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
const HttpException_1 = require("@core/HttpException/HttpException");
const SystemErrors_1 = require("@core/SystemErrors/SystemErrors");
const errorHandler_1 = require("@core/errorHandler/errorHandler");
const _1 = require(".");
const Twilio_1 = require("../Twilio");
class UsersRepository {
    index(_, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield _1.UsersModel.find().populate("avatar", "-_id");
                return res.status(200).json(users);
            }
            catch (err) {
                return (0, errorHandler_1.errorHandler)(err, res);
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const file = req.file;
                if (!file) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.FILE_NOT_FOUND);
                }
                body.avatar = file.buffer;
                const user = yield _1.UsersModel.create(body);
                return res.status(201).json(user);
            }
            catch (error) {
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield _1.UsersModel.findById(id);
                if (!user) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.USER_NOT_FOUND);
                }
                yield user.deleteOne();
                return res.status(204).json(null);
            }
            catch (err) {
                return (0, errorHandler_1.errorHandler)(err, res);
            }
        });
    }
    sendWhatsappCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phone } = req.body;
                yield _1.UsersModel.findByPhone(phone);
                yield Twilio_1.TwilioRepository.sendOTP(phone);
                return res.status(200).json({ goToVerify: true });
            }
            catch (error) {
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
    verifySms(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { code, phone } = req.body;
                const user = yield _1.UsersModel.findByPhone(phone);
                const verification = yield Twilio_1.TwilioRepository.verifyOTP(code, phone);
                if (verification instanceof Error) {
                    throw verification;
                }
                if (!verification || !verification.valid) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.INVALID_CODE);
                }
                yield user.updateOne({ phoneConfirmed: true });
                return res.status(200).json(verification);
            }
            catch (error) {
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
}
exports.default = new UsersRepository();
