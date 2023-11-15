"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const BaseController_1 = require("@core/BaseController/BaseController");
const Router_1 = require("@core/Router");
const AuthRepository_1 = __importDefault(require("./AuthRepository"));
class AuthController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.defineRoutes();
    }
    defineRoutes() {
        this.router.post(Router_1.ENDPOINTS.AUTH_LOGIN_EMAIL, AuthRepository_1.default.loginWithEmail);
        this.router.post(Router_1.ENDPOINTS.AUTH_VERIFY_WHATSAPP, AuthRepository_1.default.verifyWhatsappCode);
        this.router.post(Router_1.ENDPOINTS.AUTH_SEND_WHATSAPP_CODE, AuthRepository_1.default.sendWhatsappCode);
        this.router.get(Router_1.ENDPOINTS.AUTH_GET_CURRENT_USER, AuthRepository_1.default.isAuthenticated, AuthRepository_1.default.getCurrentUser);
    }
}
exports.AuthController = AuthController;
