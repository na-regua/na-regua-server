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
const index_1 = require("@core/index");
const Barbers_1 = require("../Barbers");
const Twilio_1 = require("../Twilio");
const Users_1 = require("../Users");
const Workers_1 = require("../Workers");
class AuthRepository {
    loginWithEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.INVALID_EMAIL);
                }
                if (!password) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.INVALID_PASSWORD);
                }
                const user = yield Users_1.UsersModel.findByCredentials(email, password);
                yield user.populate("avatar");
                const accessToken = yield user.generateAuthToken();
                if (user.role === "admin" || user.role === "worker") {
                    const worker = yield Workers_1.WorkersModel.findOne({ user: user._id });
                    if (!worker) {
                        throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.WORKER_NOT_FOUND);
                    }
                    const barber = yield Barbers_1.BarbersModel.findOne({
                        workers: { $in: [worker._id] },
                    });
                    if (!barber) {
                        throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.BARBER_NOT_FOUND);
                    }
                    yield barber.populate("avatar");
                    return res.status(200).json({ accessToken, barber, user });
                }
                return res.status(200).json({ accessToken, user });
            }
            catch (error) {
                return (0, index_1.errorHandler)(error, res);
            }
        });
    }
    sendWhatsappCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phone } = req.body;
                yield Users_1.UsersModel.findByPhone(phone);
                yield Twilio_1.TwilioRepository.sendOTP(phone);
                return res.status(200).json({ goToVerify: true });
            }
            catch (error) {
                return (0, index_1.errorHandler)(error, res);
            }
        });
    }
    verifyWhatsappCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { code, phone } = req.body;
                const user = yield Users_1.UsersModel.findOne({ phone });
                if (!user) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.USER_NOT_FOUND);
                }
                const verification = yield Twilio_1.TwilioRepository.verifyOTP(code, phone);
                if (!verification || !verification.valid) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.INVALID_CODE);
                }
                yield user.updateOne({ phoneConfirmed: true });
                const accessToken = yield user.generateAuthToken();
                yield user.populate("avatar");
                if (user.role === "admin" || user.role === "worker") {
                    const worker = yield Workers_1.WorkersModel.findOne({ user: user._id });
                    if (!worker) {
                        throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.WORKER_NOT_FOUND);
                    }
                    const barber = yield Barbers_1.BarbersModel.findOne({
                        workers: { $in: [worker._id] },
                    });
                    if (!barber) {
                        throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.BARBER_NOT_FOUND);
                    }
                    if (user.role === "admin" && barber.phone === user.phone) {
                        yield barber.updateOne({ phoneConfirmed: true });
                    }
                    return res.status(200).json({ accessToken, barber, user });
                }
                return res.status(200).json({ accessToken, user });
            }
            catch (error) {
                if (error.code) {
                    return (0, index_1.errorHandler)(new index_1.HttpException(400, error.code), res);
                }
                return (0, index_1.errorHandler)(error, res);
            }
        });
    }
    isAuthenticated(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let token = req.headers.authorization;
                if (!token) {
                    throw new index_1.HttpException(403, index_1.SYSTEM_ERRORS.FORBIDDEN);
                }
                token = token.replace("Bearer", "").trim();
                const user = yield Users_1.UsersModel.findByToken(token);
                yield user.populate("avatar");
                if (!user) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.UNAUTHORIZED);
                }
                res.locals.user = user;
                next();
            }
            catch (err) {
                return (0, index_1.errorHandler)(err, res);
            }
        });
    }
    isAdmin(_, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = res.locals;
                if (user.role !== "admin") {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.FORBIDDEN);
                }
                const worker = yield Workers_1.WorkersModel.findOne({ user: user._id });
                if (!worker) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.WORKER_NOT_FOUND);
                }
                const barber = yield Barbers_1.BarbersModel.findOne({
                    workers: { $in: [worker._id] },
                });
                if (!barber) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.BARBER_NOT_FOUND);
                }
                res.locals.barber = barber;
                next();
            }
            catch (err) {
                return (0, index_1.errorHandler)(err, res);
            }
        });
    }
    getCurrentUser(_, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = res.locals.user;
                const response = {
                    user,
                };
                if (!user) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.USER_NOT_FOUND);
                }
                yield user.populate("avatar");
                if (user.role === "admin" || user.role === "worker") {
                    const worker = yield Workers_1.WorkersModel.findOne({ user: user._id });
                    if (!worker) {
                        throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.WORKER_NOT_FOUND);
                    }
                    const filter = {
                        workers: {
                            $in: [worker._id],
                        },
                    };
                    const barber = yield Barbers_1.BarbersModel.findOne(filter);
                    if (!barber) {
                        throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.BARBER_NOT_FOUND);
                    }
                    yield barber.populate("avatar");
                    response.barber = barber;
                }
                return res.status(200).json(response);
            }
            catch (error) {
                return (0, index_1.errorHandler)(error, res);
            }
        });
    }
}
exports.default = new AuthRepository();
