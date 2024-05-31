import { BaseController, ENDPOINTS } from "@core/index";
import { AuthRepository } from "../Auth";
import SchedulesRepository from "./SchedulesRepository";

export class SchedulesController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.get(
			ENDPOINTS.SCHEDULES_LIST_BY_TOKEN,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			SchedulesRepository.listByToken
		);

		this.router.get(
			ENDPOINTS.SCHEDULES_SCHEDULED_DAYS,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			SchedulesRepository.listScheduledDates
		);

		this.router.post(
			ENDPOINTS.SCHEDULES_CREATE,
			AuthRepository.is_authenticated,
			SchedulesRepository.create
		);
	}
}
