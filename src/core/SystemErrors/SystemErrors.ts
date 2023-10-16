export const SYSTEM_ERRORS = {
	INVALID_CEP: "CEP inválido!",
	INVALID_PHONE_NUMBER: "Número de telefone inválido!",
	INVALID_CODE: "Código de verificação inválido!",
	INVALID_EMAIL: "Email inválido!",
	INVALID_PASSWORD: "Senha inválida!",
	INVALID_LOGIN_TYPE: "Tipo de login inválido!",
	INVALID_TOKEN: "Token inválido!",

	UNAVAILABLE_MESSAGE_SERVICE: "Serviço de Mensagens indisponível!",

	BARBER_NOT_FOUND: "Barbeiro não encontrado!",
	USER_NOT_FOUND: "Usuário não encontrado.",
	FILE_NOT_FOUND: "Nenhum arquivo encontrado!",
	TOKEN_NOT_FOUND: "Token não encontrado!",
	SERVICE_NOT_FOUND: "Serviço não encontrado!",
	WORKER_NOT_FOUND: "Funcionário não encontrado!",

	WORKER_NOT_CREATED: "Não foi possível criar o Funcionário!",

	USER_ALREADY_EXISTS: "Usuário já existe.",

	INTERNAL_SERVER_ERROR: "Erro interno do servidor!",
	UNAUTHORIZED: "Não autorizado! Faça login para acessar este recurso!",
	FORBIDDEN: "Proibido! Você não tem permissão para acessar este recurso!",

	"20404": "Nenhuma solicitação de verificação!",
};

export type TSystemErrors = typeof SYSTEM_ERRORS;
