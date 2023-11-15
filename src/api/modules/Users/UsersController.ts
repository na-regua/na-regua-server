import { multerUpload } from "@config/multer";
import { BaseController } from "@core/BaseController/BaseController";
import { ENDPOINTS } from "@core/Router";
import UsersRepository from "./UsersRepository";

export class UsersController extends BaseController {
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
