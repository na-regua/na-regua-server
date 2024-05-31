export enum SYSTEM_ERRORS {
	// Invalid data
	INVALID_CEP = "INVALID_CEP",
	INVALID_PHONE_NUMBER = "INVALID_PHONE_NUMBER",
	INVALID_CODE = "INVALID_CODE",
	INVALID_EMAIL = "INVALID_EMAIL",
	INVALID_PASSWORD = "INVALID_PASSWORD",
	INVALID_LOGIN_TYPE = "INVALID_LOGIN_TYPE",
	INVALID_TOKEN = "INVALID_TOKEN",
	INVALID_FILE = "INVALID_FILE",
	INVALID_SCHEDULE_DATE = "INVALID_SCHEDULE_DATE",

	//Auth
	TOKEN_NOT_FOUND = "TOKEN_NOT_FOUND",

	// Barber
	BARBER_NOT_CREATED = "BARBER_NOT_CREATED",
	BARBER_NOT_COMPLETED = "BARBER_NOT_COMPLETED",
	BARBER_NOT_FOUND = "BARBER_NOT_FOUND",
	BARBER_IS_CLOSED = "BARBER_IS_CLOSED",

	// Queue
	QUEUE_NOT_FOUND = "QUEUE_NOT_FOUND",
	QUEUE_CAN_CREATE_ONLY_ONE_PER_DAY = "QUEUE_CAN_CREATE_ONLY_ONE_PER_DAY",
	USER_ALREADY_IN_QUEUE = "USER_ALREADY_IN_QUEUE",
	USER_ALREADY_IN_OTHER_QUEUE = "USER_ALREADY_IN_OTHER_QUEUE",

	// User
	USER_NOT_CREATED = "USER_NOT_CREATED",
	USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
	USER_NOT_FOUND = "USER_NOT_FOUND",

	// HTTP Errors
	INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
	UNAUTHORIZED = "UNAUTHORIZED",
	FORBIDDEN = "FORBIDDEN",

	// File
	FILE_NOT_FOUND = "FILE_NOT_FOUND",
	FILE_NOT_SENT = "FILE_NOT_SENT",
	FILE_NOT_CREATED = "FILE_NOT_CREATED",
	THUMBS_LIMIT_EXCEEDED = "THUMBS_LIMIT_EXCEEDED",

	// Notification
	NOTIFICATION_NOT_FOUND = "NOTIFICATION_NOT_FOUND",

	// Services
	SERVICE_NOT_CREATED = "SERVICE_NOT_CREATED",
	SERVICE_NOT_FOUND = "SERVICE_NOT_FOUND",
	BARBER_SHOULD_HAVE_ONE_SERVICE = "BARBER_SHOULD_HAVE_ONE_SERVICE",
	NO_SERVICES_TO_DELETE = "NO_SERVICES_TO_DELETE",

	// Schedule
	SCHEDULE_NOT_CREATED = "SCHEDULE_NOT_CREATED",

	// Worker
	WORKER_NOT_FOUND = "WORKER_NOT_FOUND",
	WORKER_NOT_CREATED = "WORKER_NOT_CREATED",
	WORKER_NOT_IN_QUEUE = "WORKER_NOT_IN_QUEUE",
	NO_WORKERS_TO_DELETE = "NO_WORKERS_TO_DELETE",
	BARBER_SHOULD_HAVE_ONE_WORKER = "BARBER_SHOULD_HAVE_ONE_WORKER",

	// Ticket
	TICKET_NOT_FOUND = "TICKET_NOT_FOUND",
	TICKET_NOT_IN_QUEUE = "TICKET_NOT_IN_QUEUE",

	// Auth Verify
	TWILIO_20404 = "AUTH_NO_VERIFICATION_FOUND",
	TWILIO_60202 = "AUTH_CHECK_MAX_ATTEMPTS",
	TWILIO_60203 = "AUTH_SEND_MAX_ATTEMPTS",
	UNAVAILABLE_MESSAGE_SERVICE = "UNAVAILABLE_MESSAGE_SERVICE",
}

export const TWILIO_ERRORS = ["20404", "60202", "60203"];

export type TSystemErrors = typeof SYSTEM_ERRORS;
