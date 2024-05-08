import expsession from "express-session";

export const sessionMiddleware = expsession({
	secret: process.env.SESSION_SECRET || 'SECRET',
	saveUninitialized: true,
	resave: true,
});
