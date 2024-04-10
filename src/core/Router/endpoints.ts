export const ENDPOINTS = {
	/**
	 * Barbers
	 * */
	BARBERS_BY_TOKEN: "/barbers/by-token",
	BARBERS_LIST: "/barbers/",
	BARBERS_UPDATE: "/barbers/",
	BARBERS_DELETE: "/barbers/",
	BARBERS_SIGN_UP: "/barbers/sign-up",
	BARBERS_COMPLETE_PROFILE: "/barbers/complete-profile",
  /**
   * Users
   * */
	USERS_LIST: "/users/",
	USERS_CREATE: "/users/",
	USERS_UPDATE: "/users/:id",
	USERS_SEND_WHATSAPP_CODE: "/users/send/whatsapp-code",
	USERS_VERIFY_WHATSAPP_CODE: "/users/verify/whatsapp",
	USERS_DELETE: "/users/:id",
	/**
	 * Files
	 * */
	FILES_BARBER: "/files/barber",
	FILES_USER: "/files/user",
	FILES_UPDATE_USER: "/files/:avatarId/user",
	FILES_UPDATE_BARBER_AVATAR: "/files/:avatarId/barber/",
	FILES_CREATE: "/files/",
	/**
	 * Workers
	 * */
	WORKERS_LIST: "/workers/",
	WORKERS_CREATE: "/workers/",
	WORKERS_UPDATE: "/workers/:id",
	WORKERS_DELETE: "/workers/:id",
	/**
	 * Auth
	 * */
	AUTH_LOGIN_EMAIL: "/auth/login/email",
	AUTH_VERIFY_WHATSAPP: "/auth/verify/whatsapp",
	AUTH_SEND_WHATSAPP_CODE: "/auth/send/whatsapp-code",
	AUTH_GET_CURRENT_USER: "/auth/me",
	/**
	 * Services
	 * */
	SERVICES_LIST: "/services/",
	SERVICES_UPDATE: "/services/:id",
	SERVICES_CREATE: "/services/",
	SERVICES_DELETE: "/services/:id",
};
