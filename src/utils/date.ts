export function getTodayAndNextTo(addDays: number): {
	today: Date;
	nextDay: Date;
} {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const nextDay = new Date(today);
	nextDay.setDate(today.getDate() + addDays);

	return { today, nextDay };
}
