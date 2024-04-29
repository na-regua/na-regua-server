import { BaseController, ENDPOINTS } from "@core/index";
import TicketRepository from "./TicketRepository";
import { AuthRepository } from "../Auth";

class TicketController extends BaseController {
	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(ENDPOINTS.TICKET_LIST, TicketRepository.index);

		this.router.post(
			ENDPOINTS.TICKET_CREATE,
			AuthRepository.isAuthenticated,
			TicketRepository.create
		);
	}
}

export { TicketController };
