import { BaseController, ENDPOINTS } from "@core/index";
import TicketsRepository from "./TicketsRepository";
import { AuthRepository } from "../Auth";

export class TicketsController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.get(ENDPOINTS.TICKETS_LIST, TicketsRepository.index);
		this.router.get(
			ENDPOINTS.TICKETS_USER_TODAY_TICKETS,
			AuthRepository.is_authenticated,
			TicketsRepository.user_today_tickets
		);

		this.router.post(
			ENDPOINTS.TICKETS_CREATE,
			AuthRepository.is_authenticated,
			TicketsRepository.create
		);

		this.router.put(
			ENDPOINTS.TICKETS_RATE,
			AuthRepository.is_authenticated,
			TicketsRepository.rate
		);
	}
}
