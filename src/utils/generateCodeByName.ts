export function generateCodeByName(): string {
	return Math.floor(Math.random() * 167772151212)
		.toString(16)
		.toLocaleUpperCase();
}
