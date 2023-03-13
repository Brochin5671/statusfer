// Use rate limiter
const rateLimit = require("express-rate-limit");

// Limits statuses per ip to 2 per 5 seconds
const statusLimiter = rateLimit({
	windowMs: 1000 * 5,
	max: 2,
	message: {error: '429 Too Many Requests', message: 'You are posting too fast!'},
	headers: true
});
module.exports.statusLimiter = statusLimiter;