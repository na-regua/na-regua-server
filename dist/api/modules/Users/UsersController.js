"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const multer_1 = require("@config/multer");
const BaseController_1 = require("@core/BaseController/BaseController");
const Router_1 = require("@core/Router");
const UsersRepository_1 = __importDefault(require("./UsersRepository"));
class UsersController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.defineRoutes();
    }
    defineRoutes() {
        this.router.get(Router_1.ENDPOINTS.USERS_LIST, UsersRepository_1.default.index);
        this.router.post(Router_1.ENDPOINTS.USERS_CREATE, multer_1.multerUpload.single("file"), UsersRepository_1.default.create);
        this.router.post(Router_1.ENDPOINTS.USERS_SMS_TEST, UsersRepository_1.default.verifySms);
        this.router.delete(Router_1.ENDPOINTS.USERS_DELETE, UsersRepository_1.default.delete);
    }
}
exports.UsersController = UsersController;
