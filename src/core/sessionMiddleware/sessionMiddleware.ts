const expsession = require('express-session');

export const sessionMiddleware = expsession({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: true
});
