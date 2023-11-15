"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const BaseController_1 = require("@core/BaseController/BaseController");
const Router_1 = require("@core/Router");
const Auth_repository_1 = __importDefault(require("./Auth.repository"));
class AuthController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.defineRoutes();
    }
    defineRoutes() {
        this.router.post(Router_1.ENDPOINTS.AUTH_LOGIN_EMAIL, Auth_repository_1.default.loginWithEmail);
        this.router.post(Router_1.ENDPOINTS.AUTH_VERIFY_WHATSAPP, Auth_repository_1.default.verifyWhatsappCode);
        this.router.post(Router_1.ENDPOINTS.AUTH_SEND_WHATSAPP_CODE, Auth_repository_1.default.sendWhatsappCode);
        this.router.get(Router_1.ENDPOINTS.AUTH_GET_CURRENT_USER, Auth_repository_1.default.isAuthenticated, Auth_repository_1.default.getCurrentUser);
    }
}
exports.AuthController = AuthController;
