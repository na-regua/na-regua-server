import { BaseController } from "@core/index";
import { AuthRepository } from "../Auth";
import WorkersRepository from "./Workers.repository";
import { multerUpload } from "@config/multer";

export class WorkersController extends BaseController {
	routePrefix = "/workers";

	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(
			this.routePrefix,
			[],
			AuthRepository.isAuthenticated,
			WorkersRepository.index
		);

		this.router.post(
			this.routePrefix,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			WorkersRepository.create
		);

		this.router.put(
			`${this.routePrefix}/:id`,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			WorkersRepository.update
		);

		this.router.delete(
			`${this.routePrefix}/:id`,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			WorkersRepository.delete
		);
	}
}
