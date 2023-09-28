import { BaseController } from "@core/BaseController";
import BarbersRepository from "./Barbers.repository";
import { multerUpload } from "@config/multer";

export class BarbersController extends BaseController {
	routePrefix = "/barbers";

	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(this.routePrefix, BarbersRepository.index);
		this.router.post(
			this.routePrefix + "/pre-signin",
			multerUpload.array("files"),
			BarbersRepository.preSignIn
		);
		this.router.post(this.routePrefix + "/sms/send", BarbersRepository.smsTest);

		this.router.delete(`${this.routePrefix}/:id`, BarbersRepository.delete);
	}
}
