export enum ENDPOINTS {
	/**
	 * Auth
	 * */
	AUTH_LOGIN_EMAIL = "/auth/login/email",
	AUTH_VERIFY_CODE = "/auth/verify/code",
	AUTH_SEND_CODE = "/auth/send/code",
	AUTH_GET_CURRENT_USER = "/auth/me",
	/**
	 * Barbers
	 * */
	BARBERS_BY_TOKEN = "/barbers/by-token",
	BARBERS_LIST = "/barbers/",
	BARBERS_UPDATE = "/barbers/",
	BARBERS_DELETE = "/barbers/",
	BARBERS_SIGN_UP = "/barbers/sign-up",
	BARBERS_COMPLETE_PROFILE = "/barbers/complete-profile",
	/**
	 * Tickets
	 * */
	TICKETS_CREATE = "/tickets/",
	TICKETS_LIST = "/tickets/",
	/**
	 * Files
	 * */
	FILES_BARBER = "/files/barber",
	FILES_USER = "/files/user",
	FILES_UPDATE_USER = "/files/:avatarId/user",
	FILES_UPDATE_BARBER_AVATAR = "/files/:avatarId/barber/",
	FILES_UPDATE_BARBER_THUMB = "/files/barber/thumb/:thumbId",
	FILES_UPLOAD_BARBER_THUMBS = "/files/barber/thumb/",
	FILES_DELETE_BARBER_THUMBS = "/files/barber/thumb/:thumbId",
	FILES_CREATE = "/files/",
	/**
	 * Notifications
	 * */
	NOTIFICATION_LIST_BY_USER = "/notifications",
	NOTIFICATION_MARK_AS_VIEWED = "/notifications/:userId/:notificationId",
	NOTIFICATION_MARK_ALL_AS_VIEWED = "/notifications/:userId",
	/**
	 * Queues
	 * */
	QUEUE_CREATE = "/queues/",
	QUEUE_LIST = "/queues/",

	/**
	 * QueueTickts
	 * */

	/**
	 * Schedules
	 * */
	SCHEDULES_LIST_BY_TOKEN = "/schedules/",
	SCHEDULES_CREATE = "/schedules/",
	SCHEDULES_SCHEDULED_DAYS = "/schedules/scheduled-days",
	/**
	 * Services
	 * */
	SERVICES_LIST = "/services/",
	SERVICES_UPDATE = "/services/:serviceId",
	SERVICES_CREATE = "/services/",
	SERVICES_DELETE = "/services/:serviceId",
	/**
	 * Users
	 * */
	USERS_LIST = "/users/",
	USERS_CREATE = "/users/",
	USERS_UPDATE = "/users/:id",
	USERS_SEND_WHATSAPP_CODE = "/users/send/whatsapp-code",
	USERS_VERIFY_WHATSAPP_CODE = "/users/verify/whatsapp",
	USERS_DELETE = "/users/:id",

	/**
	 * Workers
	 * */
	WORKERS_LIST = "/workers/",
	WORKERS_CREATE = "/workers/",
	WORKERS_UPDATE = "/workers/:id",
	WORKERS_DELETE = "/workers/:id",
}
