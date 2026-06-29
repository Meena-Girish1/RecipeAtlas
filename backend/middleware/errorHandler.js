const multer = require('multer');

/** 404 handler — placed after all routes in server.js. */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

/**
 * Centralized error handler. Express recognizes middleware with 4 args as
 * an error handler. Translates the various error shapes we can encounter
 * (Mongoose validation, Multer upload errors, Claude API errors, plain
 * thrown errors) into a consistent JSON response shape for the frontend.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid id: ${err.value}`;
  }

  // Multer upload errors (file too large, bad mimetype, etc.)
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.message;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { notFound, errorHandler };
