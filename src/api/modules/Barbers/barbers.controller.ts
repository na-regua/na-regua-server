import { BaseController } from "@core/BaseController";
import BarbersRepository from "./Barbers.repository";
import { multerUpload } from "@config/multer";
import { AuthRepository } from "../Auth";

export class BarbersController extends BaseController {
	routePrefix = "/barbers";

	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(this.routePrefix, BarbersRepository.index);
		this.router.get(
			`${this.routePrefix}/by-token`,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			BarbersRepository.show
		);
		this.router.put(
			`${this.routePrefix}/:id`,
			AuthRepository.isAuthenticated,
			AuthRepository.isBarberAdmin,
			BarbersRepository.update
		);
		this.router.post(
			`${this.routePrefix}/sign-up`,
			multerUpload.array("files"),
			BarbersRepository.preSignIn
		);
		this.router.delete(
			`${this.routePrefix}/:id`,
			AuthRepository.isAuthenticated,
			AuthRepository.isBarberAdmin,
			BarbersRepository.delete
		);
	}
}
