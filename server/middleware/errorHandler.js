/**
 * Centralized error handling middleware.
 * Formats all errors into a predictable JSON schema and logs internal errors.
 */
export function errorHandler(err, req, res, _next) {
  const statusCode = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    stack: isProd ? undefined : err.stack,
    timestamp: new Date().toISOString(),
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message:
        statusCode === 500 && isProd
          ? 'Erro interno no servidor da agência.'
          : err.message || 'Erro inesperado.',
      code: err.code || 'INTERNAL_ERROR',
      statusCode,
    },
  });
}
