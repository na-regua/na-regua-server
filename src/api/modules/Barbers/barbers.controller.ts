import { BaseController } from "@core/BaseController";
import barbersRepository from "./Barbers.repository";
import { multerUpload } from "@config/multer";

export class BarbersController extends BaseController {
	routePrefix = "/barbers";

	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(this.routePrefix, barbersRepository.index);
		this.router.post(
			this.routePrefix + "/pre-signin",
			multerUpload.array("files"),
			barbersRepository.preSignIn
		);
		this.router.post(this.routePrefix + "/sms/send", barbersRepository.smsTest);
		this.router.post(
			this.routePrefix + "/sms/verify",
			barbersRepository.verifySmsTest
		);

		this.router.delete(`${this.routePrefix}/:id`, barbersRepository.delete);
	}
}
