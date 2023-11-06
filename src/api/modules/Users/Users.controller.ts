import { BaseController } from "@core/BaseController";
import UsersRepository from "./Users.repository";
import { multerUpload } from "@config/multer";
import { ENDPOINTS } from "@core/Router";

export class UsersController extends BaseController {
	routePrefix = "/users";

	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(ENDPOINTS.USERS_LIST, UsersRepository.index);
		this.router.post(
			ENDPOINTS.USERS_CREATE,
			multerUpload.single("file"),
			UsersRepository.create
		);

		this.router.post(ENDPOINTS.USERS_SMS_TEST, UsersRepository.verifySms);

		this.router.delete(ENDPOINTS.USERS_DELETE, UsersRepository.delete);
	}
}
