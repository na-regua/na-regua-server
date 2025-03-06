import { BaseController, ENDPOINTS } from "@core/index";
import { AuthRepository } from "../Auth";
import SchedulesRepository from "./SchedulesRepository";

export class SchedulesController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.get(
			ENDPOINTS.SCHEDULED_LIST_APPOINTMENTS,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			SchedulesRepository.list_schedules_appointments
		);

		this.router.get(
			ENDPOINTS.SCHEDULES_LIST_AVAILABLE,
			AuthRepository.is_authenticated,
			SchedulesRepository.list_available
		);

		this.router.post(
			ENDPOINTS.SCHEDULES_CREATE,
			AuthRepository.is_authenticated,
			SchedulesRepository.create
		);
	}
}
