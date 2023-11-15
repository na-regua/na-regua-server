"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarbersController = void 0;
const BaseController_1 = require("@core/BaseController/BaseController");
const Router_1 = require("@core/Router");
const Auth_1 = require("../Auth");
const Barbers_repository_1 = __importDefault(require("./Barbers.repository"));
class BarbersController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.defineRoutes();
    }
    defineRoutes() {
        this.router.get(Router_1.ENDPOINTS.BARBERS_LIST, Barbers_repository_1.default.index);
        this.router.get(Router_1.ENDPOINTS.BARBERS_BY_TOKEN, Auth_1.AuthRepository.isAuthenticated, Auth_1.AuthRepository.isAdmin, Barbers_repository_1.default.show);
        this.router.put(Router_1.ENDPOINTS.BARBERS_UPDATE, Auth_1.AuthRepository.isAuthenticated, Auth_1.AuthRepository.isAdmin, Barbers_repository_1.default.update);
        this.router.post(Router_1.ENDPOINTS.BARBERS_SIGN_UP, Barbers_repository_1.default.signUp);
        this.router.delete(Router_1.ENDPOINTS.BARBERS_DELETE, Auth_1.AuthRepository.isAuthenticated, Auth_1.AuthRepository.isAdmin, Barbers_repository_1.default.delete);
        this.router.post(Router_1.ENDPOINTS.BARBERS_COMPLETE_PROFILE, Auth_1.AuthRepository.isAuthenticated, Auth_1.AuthRepository.isAdmin, Barbers_repository_1.default.completeProfile);
    }
}
exports.BarbersController = BarbersController;
