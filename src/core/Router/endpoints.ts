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
	BARBERS_OPEN = "/barbers/open",
	BARBERS_CUSTOMERS = "/barbers/customers",
	/**
	 * Tickets
	 * */
	TICKETS_CREATE = "/tickets/",
	TICKETS_LIST = "/tickets/",
	TICKETS_BY_USER_TODAY = "/tickets/user/today",
	TICKETS_BY_USER = "/tickets/user",
	TICKETS_RATE = "/tickets/:ticketId/rate",
	/**
	 * Files
	 * */
	FILES_BARBER = "/files/barber",
	FILES_USER = "/files/user",
	FILES_UPDATE_USER_AVATAR = "/files/:avatarId/user",
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
	QUEUE_BARBER_TODAY = '/queues/today',
  QUEUE_BARBER_TODAY_BY_ID = '/queues/:barberId/today',
	QUEUE_LAST_POSITION = "/queues/:queueId/last-position",
	QUEUE_USER_JOIN = "/queues/join/user",
	QUEUE_WORKER_JOIN = "/queues/join/worker",
	QUEUE_WORKER_APPROVE_TICKET = "/queues/worker/approve/:ticketId",
	QUEUE_USER_LEAVE = "/queues/leave/:ticketId",
	QUEUE_WORKER_REJECT_TICKET = "/queues/worker/reject/:ticketId",
	QUEUE_WORKER_GO_NEXT = "/queues/worker/go-next",

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
	USERS_LIST_FAVORITES = "/users/favorites",
	USERS_CREATE = "/users/",
	USERS_UPDATE = "/users/:id",
	USERS_SEND_WHATSAPP_CODE = "/users/send/whatsapp-code",
	USERS_VERIFY_WHATSAPP_CODE = "/users/verify/whatsapp",
	USERS_DELETE = "/users/:id",
	USERS_IS_ON_QUEUE = "/users/is-on/queue",
	USERS_FAVORITE_BARBER = "/users/favorite/:barberId",

	/**
	 * Workers
	 * */
	WORKERS_LIST = "/workers/",
	WORKERS_CREATE = "/workers/",
	WORKERS_UPDATE = "/workers/:id",
	WORKERS_DELETE = "/workers/:id",
}
