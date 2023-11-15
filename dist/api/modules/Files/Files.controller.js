"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const multer_1 = require("@config/multer");
const BaseController_1 = require("@core/BaseController/BaseController");
const Router_1 = require("@core/Router");
const Auth_1 = require("../Auth");
const Files_repository_1 = __importDefault(require("./Files.repository"));
class FilesController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.defineRoutes();
    }
    defineRoutes() {
        this.router.post(Router_1.ENDPOINTS.FILES_CREATE, Files_repository_1.default.uploadFileToStorage);
        this.router.put(Router_1.ENDPOINTS.FILES_UPDATE_USER, multer_1.multerUpload.single("file"), Auth_1.AuthRepository.isAuthenticated, Files_repository_1.default.updateUserAvatar);
        this.router.put(Router_1.ENDPOINTS.FILES_UPDATE_BARBER_AVATAR, Auth_1.AuthRepository.isAuthenticated, Auth_1.AuthRepository.isAdmin, Files_repository_1.default.updateBarberAvatar);
    }
}
exports.FilesController = FilesController;
