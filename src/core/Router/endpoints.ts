export const ENDPOINTS = {
	BARBERS_BY_TOKEN: "/barbers/by-token",
	BARBERS_LIST: "/barbers/",
	BARBERS_UPDATE: "/barbers/",
	BARBERS_DELETE: "/barbers/",
	BARBERS_SIGN_UP: "/barbers/sign-up",
	BARBERS_COMPLETE_PROFILE: "/barbers/complete-profile",

	USERS_LIST: "/users/",
	USERS_CREATE: "/users/",
	USERS_SEND_WHATSAPP_CODE: "/users/send/whatsapp-code",
	USERS_VERIFY_WHATSAPP_CODE: "/users/verify/whatsapp",
	USERS_DELETE: "/users/:id",

	FILES_BARBER: "/files/barber",
	FILES_USER: "/files/user",
	FILES_UPDATE_USER: "/files/:id/user",
	FILES_UPDATE_BARBER_AVATAR: "/files/:avatarId/barber/",
	FILES_CREATE: "/files/",

	WORKERS_LIST: "/workers/",
	WORKERS_CREATE: "/workers/",
	WORKERS_UPDATE: "/workers/:id",
	WORKERS_DELETE: "/workers/:id",

	AUTH_LOGIN_EMAIL: "/auth/login/email",
	AUTH_VERIFY_WHATSAPP: "/auth/verify/whatsapp",
	AUTH_SEND_WHATSAPP_CODE: "/auth/send/whatsapp-code",
	AUTH_GET_CURRENT_USER: "/auth/me",

	SERVICES_LIST: "/services/",
	SERVICES_UPDATE: "/services/:id",
	SERVICES_CREATE: "/services/",
	SERVICES_DELETE: "/services/:id",
};
