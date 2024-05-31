export function getTodayAndNextTo(
	addDays: number,
	todayDate?: Date
): {
	today: Date;
	next_day: Date;
} {
	const today = todayDate || new Date();
	today.setHours(0, 0, 0, 0);
	const next_day = new Date(today);
	next_day.setDate(today.getDate() + addDays);

	return { today, next_day };
}
