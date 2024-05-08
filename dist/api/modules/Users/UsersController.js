'use strict';var __importDefault=this&&this.__importDefault||function(mod){return mod&&mod.__esModule?mod:{'default':mod};};Object.defineProperty(exports,'__esModule',{value:true});exports.UsersController=void 0;const multer_1=require('../../../config/multer');const BaseController_1=require('../../../core/BaseController/BaseController');const Router_1=require('../../../core/Router');const UsersRepository_1=__importDefault(require('./UsersRepository'));const Auth_1=require('../Auth');class UsersController extends BaseController_1.BaseController{constructor(){super();}defineRoutes(){this.router.get(Router_1.ENDPOINTS.USERS_LIST,UsersRepository_1.default.index);this.router.put(Router_1.ENDPOINTS.USERS_UPDATE,Auth_1.AuthRepository.isAuthenticated,UsersRepository_1.default.update);this.router.post(Router_1.ENDPOINTS.USERS_CREATE,multer_1.cloudinaryStorage.single('file'),UsersRepository_1.default.create);this.router.post(Router_1.ENDPOINTS.USERS_SEND_WHATSAPP_CODE,UsersRepository_1.default.sendWhatsappCode);this.router.post(Router_1.ENDPOINTS.USERS_VERIFY_WHATSAPP_CODE,UsersRepository_1.default.verifySms);this.router.delete(Router_1.ENDPOINTS.USERS_DELETE,UsersRepository_1.default.delete);}}exports.UsersController=UsersController;