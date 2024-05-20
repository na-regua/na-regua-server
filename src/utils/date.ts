export function getTodayAndNextTo(
	addDays: number,
	todayDate?: Date
): {
	today: Date;
	nextDay: Date;
} {
	const today = todayDate || new Date();
	today.setHours(0, 0, 0, 0);
	const nextDay = new Date(today);
	nextDay.setDate(today.getDate() + addDays);

	return { today, nextDay };
}
