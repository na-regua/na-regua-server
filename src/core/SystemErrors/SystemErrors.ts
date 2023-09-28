export const SYSTEM_ERRORS = {
	INVALID_CEP: "CEP inválido!",
	INVALID_PHONE_NUMBER: "Número de telefone inválido!",
	INVALID_CODE: 'Código de verificação inválido!',
	INVALID_EMAIL: "Email inválido!",
	INVALID_PASSWORD: "Senha inválida!",
	INVALID_LOGIN_TYPE: "Tipo de login inválido!",

	UNAVAILABLE_MESSAGE_SERVICE: "Serviço de Mensagens indisponível!",

	BARBER_NOT_FOUND: "Barbeiro não encontrado!",
	USER_NOT_FOUND: "Usuário não encontrado.",
	FILE_NOT_FOUND: "Nenhum arquivo encontrado!",
	USER_ALREADY_EXISTS: "Usuário já existe.",

	INTERNAL_SERVER_ERROR: "Erro interno do servidor!",
};

export type TSystemErrors = typeof SYSTEM_ERRORS;
