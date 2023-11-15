"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkersController = void 0;
const index_1 = require("@core/index");
const Auth_1 = require("../Auth");
const Workers_repository_1 = __importDefault(require("./Workers.repository"));
const Router_1 = require("@core/Router");
class WorkersController extends index_1.BaseController {
    constructor() {
        super();
        this.defineRoutes();
    }
    defineRoutes() {
        this.router.get(Router_1.ENDPOINTS.WORKERS_LIST, [], Auth_1.AuthRepository.isAuthenticated, Workers_repository_1.default.index);
        this.router.post(Router_1.ENDPOINTS.WORKERS_CREATE, Auth_1.AuthRepository.isAuthenticated, Auth_1.AuthRepository.isAdmin, Workers_repository_1.default.create);
        this.router.put(Router_1.ENDPOINTS.WORKERS_UPDATE, Auth_1.AuthRepository.isAuthenticated, Auth_1.AuthRepository.isAdmin, Workers_repository_1.default.update);
        this.router.delete(Router_1.ENDPOINTS.WORKERS_DELETE, Auth_1.AuthRepository.isAuthenticated, Auth_1.AuthRepository.isAdmin, Workers_repository_1.default.delete);
    }
}
exports.WorkersController = WorkersController;
