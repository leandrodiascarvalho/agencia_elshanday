/**
 * In-memory sliding-window rate limiter for sensitive endpoints (Chat, Briefing).
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 1 minute)
 * @param {number} options.max - Max requests per window per IP (default: 30)
 * @param {string} options.message - Error message when rate limit is exceeded
 */
export function rateLimiter({
  windowMs = 60 * 1000,
  max = 30,
  message = 'Muitas requisições. Aguarde um instante.',
} = {}) {
  const requests = new Map();

  // Periodic cleanup every 5 minutes to prevent memory leak
  setInterval(
    () => {
      const now = Date.now();
      for (const [ip, data] of requests.entries()) {
        if (now - data.startTime > windowMs) {
          requests.delete(ip);
        }
      }
    },
    5 * 60 * 1000
  ).unref();

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = requests.get(ip);

    if (!record || now - record.startTime > windowMs) {
      requests.set(ip, { startTime: now, count: 1 });
      return next();
    }

    record.count++;

    if (record.count > max) {
      res.setHeader('Retry-After', Math.ceil((record.startTime + windowMs - now) / 1000));
      return res.status(429).json({
        success: false,
        error: {
          message,
          code: 'RATE_LIMIT_EXCEEDED',
        },
      });
    }

    next();
  };
}
