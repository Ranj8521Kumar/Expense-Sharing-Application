const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Production error response
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Programming or unknown error
  console.error('ERROR:', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong',
  });
};

module.exports = errorHandler;
