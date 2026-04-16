const ApiError = require("../utils/ApiError");

function createRateLimiter({ windowMs, maxRequests, message }) {
  const requests = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip}:${req.originalUrl}`;
    const requestState = requests.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > requestState.resetAt) {
      requestState.count = 0;
      requestState.resetAt = now + windowMs;
    }

    requestState.count += 1;
    requests.set(key, requestState);

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(maxRequests - requestState.count, 0));
    res.setHeader("X-RateLimit-Reset", requestState.resetAt);

    if (requestState.count > maxRequests) {
      return next(new ApiError(429, message || "Too many requests. Please try again later."));
    }

    next();
  };
}

module.exports = {
  createRateLimiter
};
