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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = require("@config/multer");
const HttpException_1 = require("@core/HttpException/HttpException");
const SystemErrors_1 = require("@core/SystemErrors/SystemErrors");
const errorHandler_1 = require("@core/errorHandler/errorHandler");
const utils_1 = require("src/utils");
const Files_model_1 = require("../Files/Files.model");
const Twilio_1 = require("../Twilio");
const Users_1 = require("../Users");
const Workers_1 = require("../Workers");
const Barbers_model_1 = require("./Barbers.model");
class BarbersRepository {
    index(_, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const barbers = yield Barbers_model_1.BarbersModel.find();
                return res.status(200).json(barbers);
            }
            catch (err) {
                return (0, errorHandler_1.errorHandler)(err, res);
            }
        });
    }
    show(_, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const barber = res.locals.barber;
                if (!barber) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.BARBER_NOT_FOUND);
                }
                yield barber.populate({
                    path: "workers",
                    populate: {
                        path: "user",
                        populate: {
                            path: "avatar",
                        },
                    },
                });
                yield barber.populate({
                    path: "services",
                });
                return res.status(200).json(barber);
            }
            catch (error) {
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const barber = res.locals.barber;
                if (!barber) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.BARBER_NOT_FOUND);
                }
                const body = req.body;
                yield barber.updateOne(body);
                return res.status(204).json(null);
            }
            catch (error) {
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
    delete(_, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const barber = res.locals.barber;
                if (!barber) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.BARBER_NOT_FOUND);
                }
                // TODO search for it
                // barber.workers.forEach(async (worker) => {
                // 	await WorkersModel.findByIdAndDelete(worker);
                // });
                // barber.services.forEach(async (service) => {
                // 	await UsersModel.findByIdAndDelete(service);
                // });
                yield barber.deleteOne();
                return res.status(204).json(null);
            }
            catch (err) {
                return (0, errorHandler_1.errorHandler)(err, res);
            }
        });
    }
    completeProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const barber = res.locals.barber;
                yield barber.save();
                return res.status(204).json(null);
            }
            catch (error) {
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
    signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uploadedResult = yield (0, multer_1.handleMultipleUploadFile)(req, res);
                if (!uploadedResult.files || uploadedResult.files.length === 0) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.FILE_NOT_FOUND);
                }
                const _a = uploadedResult.body, { password } = _a, body = __rest(_a, ["password"]);
                const files = uploadedResult.files;
                const createdFiles = [];
                for (const thumb of files) {
                    const file = yield Files_model_1.FilesModel.create({
                        filename: thumb.filename,
                        localPath: thumb.path,
                        url: `uploads/${thumb.filename}`,
                    });
                    createdFiles.push(file._id);
                }
                const [avatar, ...thumbs] = createdFiles.map((file) => file._id);
                const barber = yield Barbers_model_1.BarbersModel.create(Object.assign({ code: (0, utils_1.generateCodeByName)(), thumbs,
                    avatar }, body));
                if (!barber) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.BARBER_NOT_CREATED);
                }
                res.locals.barber = barber;
                const adminUser = yield Users_1.UsersModel.create({
                    name: barber.name,
                    email: barber.email,
                    phone: barber.phone,
                    password: password,
                    role: "admin",
                    avatar,
                });
                if (!adminUser) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.USER_NOT_CREATED);
                }
                res.locals.user = adminUser;
                const adminWorker = yield Workers_1.WorkersModel.create({
                    user: adminUser._id,
                    barber: barber._id,
                });
                if (!adminWorker) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.WORKER_NOT_CREATED);
                }
                res.locals.worker = adminWorker;
                barber.workers.push(adminWorker._id);
                yield barber.save();
                yield Twilio_1.TwilioRepository.sendOTP(adminUser.phone);
                return res.status(201).json({ barber, user: adminUser });
            }
            catch (error) {
                const { barber, user, worker } = res.locals;
                if (barber) {
                    yield barber.deleteOne();
                }
                if (user) {
                    yield user.deleteOne();
                }
                if (worker) {
                    yield worker.deleteOne();
                }
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
}
exports.default = new BarbersRepository();