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
const index_1 = require("@core/index");
const Files_1 = require("../Files");
const Users_1 = require("../Users");
const workers_schema_1 = require("./workers.schema");
class WorkersRepository {
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = req.query;
                const filters = {};
                if (query.barberId) {
                    filters.barber = query.barberId;
                }
                const workers = yield workers_schema_1.WorkersModel.find(filters).populate({
                    path: "user",
                    populate: {
                        path: "avatar",
                    },
                });
                return res.status(200).json(workers);
            }
            catch (error) {
                return (0, index_1.errorHandler)(error, res);
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { file, body: bodyFromReq } = yield (0, multer_1.handleSingleUploadFile)(req, res);
                if (!file) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.FILE_NOT_FOUND);
                }
                const { admin } = bodyFromReq, body = __rest(bodyFromReq, ["admin"]);
                const barber = res.locals.barber;
                if (!file) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.FILE_NOT_FOUND);
                }
                const avatarFile = yield Files_1.FilesModel.create({
                    filename: file.filename,
                    localPath: file.path,
                    url: `uploads/${file.filename}`,
                });
                body.avatar = avatarFile._id;
                body.role = !!admin ? "admin" : "worker";
                const workerUser = yield Users_1.UsersModel.create(body);
                if (!workerUser) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.USER_NOT_CREATED);
                }
                res.locals.workerUser = workerUser;
                const worker = yield workers_schema_1.WorkersModel.create({
                    user: workerUser._id,
                    barber: barber._id,
                });
                if (!worker) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.WORKER_NOT_CREATED);
                }
                res.locals.worker = worker;
                yield barber.updateOne({
                    $push: {
                        workers: worker._id,
                    },
                });
                return res.status(200).json(worker);
            }
            catch (error) {
                const workerUser = res.locals.workerUser;
                const worker = res.locals.worker;
                if (workerUser) {
                    workerUser.deleteOne();
                }
                if (worker) {
                    worker.deleteOne();
                }
                return (0, index_1.errorHandler)(error, res);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { body, file } = yield (0, multer_1.handleSingleUploadFile)(req, res);
                const workerId = req.params.id;
                const worker = yield workers_schema_1.WorkersModel.findOne({
                    _id: workerId,
                });
                if (!worker) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.WORKER_NOT_FOUND);
                }
                if (body.phone) {
                    body.phoneConfirmed = false;
                }
                const workerUser = yield Users_1.UsersModel.findByIdAndUpdate(worker.user._id);
                if (!workerUser) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.WORKER_NOT_FOUND);
                }
                const avatarFile = yield Files_1.FilesModel.findById(workerUser.avatar);
                if (file && avatarFile) {
                    yield (0, multer_1.handleRemoveFile)(avatarFile.localPath);
                    yield avatarFile.updateOne({
                        filename: file.filename,
                        localPath: file.path,
                        url: `uploads/${file.filename}`,
                    });
                }
                return res.status(201).json(workerUser);
            }
            catch (error) {
                return (0, index_1.errorHandler)(error, res);
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = req.params.id;
                const barber = res.locals.barber;
                if (!workerId) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.WORKER_NOT_FOUND);
                }
                const deletedWorker = yield workers_schema_1.WorkersModel.findByIdAndDelete(workerId);
                if (!deletedWorker) {
                    throw new index_1.HttpException(400, index_1.SYSTEM_ERRORS.WORKER_NOT_FOUND);
                }
                const deletedUser = yield Users_1.UsersModel.findByIdAndDelete(deletedWorker.user._id);
                yield barber.updateOne({
                    $pull: {
                        workers: deletedWorker._id,
                    },
                });
                return res.status(200).json({ deletedWorker, deletedUser });
            }
            catch (error) {
                return (0, index_1.errorHandler)(error, res);
            }
        });
    }
}
exports.default = new WorkersRepository();
