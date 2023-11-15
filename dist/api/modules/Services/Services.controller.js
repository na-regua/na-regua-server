"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseController_1 = require("@core/BaseController/BaseController");
const Services_repository_1 = __importDefault(require("./Services.repository"));
const Auth_1 = require("../Auth");
const Router_1 = require("@core/Router");
class ServicesController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.defineRoutes();
    }
    defineRoutes() {
        this.router.get(Router_1.ENDPOINTS.SERVICES_LIST, Auth_1.AuthRepository.isAuthenticated, Auth_1.AuthRepository.isAdmin, Services_repository_1.default.index);
        this.router.put(Router_1.ENDPOINTS.SERVICES_UPDATE, Auth_1.AuthRepository.isAuthenticated, Auth_1.AuthRepository.isAdmin, Services_repository_1.default.update);
        this.router.post(Router_1.ENDPOINTS.SERVICES_CREATE, Auth_1.AuthRepository.isAuthenticated, Auth_1.AuthRepository.isAdmin, Services_repository_1.default.create);
        this.router.delete(Router_1.ENDPOINTS.SERVICES_DELETE, Auth_1.AuthRepository.isAuthenticated, Auth_1.AuthRepository.isAdmin, Services_repository_1.default.delete);
    }
}
exports.default = ServicesController;
