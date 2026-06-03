function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message || "Server error",
    ...(err.issues ? { issues: err.issues } : {}),
    ...(process.env.NODE_ENV === "production" ? {} : { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
