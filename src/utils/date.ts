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

export function is_from_to_on_limit(
	from: Date,
	to: Date,
	limit: number
): boolean {
	const from_limit = new Date();
	from_limit.setHours(0, 0, 0, 0);
	const to_limit = new Date(from_limit);
	to_limit.setDate(from_limit.getDate() + limit);
	to_limit.setHours(20, 59, 59, 999);

	return (
		from >= from_limit && to >= from_limit && from <= to_limit && to <= to_limit
	);
}

export function is_date_on_limit(date: Date, limit: number): boolean {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const today_limit = new Date(today);
	today_limit.setDate(today.getDate() + limit);
	today_limit.setHours(20, 59, 59, 999);

	return date >= today && date <= today_limit;
}

export function remove_timezone(date: Date): Date {
	return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}

export function apply_timezone(date: Date): Date {
	return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

export const getDayToWorkDays: Record<number, string> = {
	0: "sun",
	1: "mon",
	2: "tue",
	3: "wed",
	4: "thu",
	5: "fri",
	6: "sat",
};
