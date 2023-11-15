"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const modules_1 = require("@api/modules");
const Services_controller_1 = __importDefault(require("@api/modules/Services/Services.controller"));
class Router {
    constructor(app, apiPrefix) {
        this.app = app;
        this.apiPrefix = apiPrefix;
    }
    initRoutes() {
        const barbersController = new modules_1.BarbersController();
        const servicesController = new Services_controller_1.default();
        const usersController = new modules_1.UsersController();
        const authController = new modules_1.AuthController();
        const workersController = new modules_1.WorkersController();
        const filesController = new modules_1.FilesController();
        this.app.use(`${this.apiPrefix}`, barbersController.router);
        this.app.use(`${this.apiPrefix}`, servicesController.router);
        this.app.use(`${this.apiPrefix}`, usersController.router);
        this.app.use(`${this.apiPrefix}`, authController.router);
        this.app.use(`${this.apiPrefix}`, workersController.router);
        this.app.use(`${this.apiPrefix}`, filesController.router);
    }
}
exports.Router = Router;
