import { BaseController, ENDPOINTS } from "@core/index";
import TicketsRepository from "./TicketsRepository";
import { AuthRepository } from "../Auth";

export class TicketsController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.get(ENDPOINTS.TICKETS_LIST, TicketsRepository.index);

		this.router.post(
			ENDPOINTS.TICKETS_CREATE,
			AuthRepository.isAuthenticated,
			TicketsRepository.create
		);
	}
}