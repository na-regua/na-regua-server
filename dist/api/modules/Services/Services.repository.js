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
const Services_schema_1 = require("./Services.schema");
class ServicesRepository {
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = req.query;
                const filter = {};
                if (query.barberId) {
                    filter.barber = query.barberId;
                }
                const services = yield Services_schema_1.ServicesModel.find(filter);
                return res.status(200).json(services);
            }
            catch (error) {
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const barber = res.locals.barber;
                body.barber = barber._id;
                const newService = yield Services_schema_1.ServicesModel.create(body);
                if (!newService) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.SERVICE_NOT_CREATED);
                }
                barber.services.push(newService._id);
                yield barber.save();
                return res.status(201).json(newService);
            }
            catch (error) {
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const body = req.body;
                const barber = res.locals.barber;
                const updatedService = yield Services_schema_1.ServicesModel.findOneAndUpdate({
                    _id: id,
                    barber: barber._id,
                }, body);
                return res.status(201).json(updatedService);
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
                const barber = res.locals.barber;
                const service = yield Services_schema_1.ServicesModel.findByIdAndDelete(id);
                if (!service) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.SERVICE_NOT_FOUND);
                }
                yield barber.updateOne({
                    $pull: {
                        services: service._id,
                    },
                });
                return res.status(200).json(service);
            }
            catch (error) {
                return (0, errorHandler_1.errorHandler)(error, res);
            }
        });
    }
}
exports.default = new ServicesRepository();
