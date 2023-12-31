export const SYSTEM_ERRORS = {
	INVALID_CEP: "CEP inválido!",
	INVALID_PHONE_NUMBER: "Número de telefone inválido!",
	INVALID_CODE: "Código de verificação inválido!",
	INVALID_EMAIL: "Email inválido!",
	INVALID_PASSWORD: "Senha inválida!",
	INVALID_LOGIN_TYPE: "Tipo de login inválido!",
	INVALID_TOKEN: "Token inválido!",
	INVALID_FILE: "Arquivo inválido! Somente imagens são permitidas!",

	UNAVAILABLE_MESSAGE_SERVICE: "Serviço de Mensagens indisponível!",

	BARBER_NOT_FOUND: "Barbeiro não encontrado!",
	BARBER_NOT_COMPLETED:
		"Perfil incompleto, adicione pelo menos um funcionário e um serviço!",

	USER_NOT_FOUND: "Usuário não encontrado.",
	FILE_NOT_FOUND: "Nenhum arquivo encontrado!",
	TOKEN_NOT_FOUND: "Token não encontrado!",
	SERVICE_NOT_FOUND: "Serviço não encontrado!",
	WORKER_NOT_FOUND: "Funcionário não encontrado!",

	WORKER_NOT_CREATED: "Não foi possível criar o Funcionário!",
	SERVICE_NOT_CREATED: "Não foi possível criar o Serviço!",
	BARBER_NOT_CREATED: "Não foi possível criar a Barbearia!",
	USER_NOT_CREATED: "Não foi possível criar a Usuário!",

	USER_ALREADY_EXISTS: "Usuário já existe.",

	INTERNAL_SERVER_ERROR: "Erro interno do servidor!",
	UNAUTHORIZED: "Não autorizado! Faça login para acessar este recurso!",
	FORBIDDEN: "Proibido! Você não tem permissão para acessar este recurso!",

	FILE_NOT_SENT: "Nenhum arquivo foi enviado!",

	"20404": "Nenhuma solicitação de verificação!",
};

export type TSystemErrors = typeof SYSTEM_ERRORS;
