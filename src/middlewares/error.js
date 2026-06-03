/* eslint-disable no-unused-vars */
import response from '../utils/response.js';
import ClientError from '../exceptions/client-error.js';

const ErrorHandler = (err, req, res, next) => {
  if (err instanceof ClientError) {
    return response(res, err.statusCode, err.message, null);
  }

  if (err.isJoi) {
    return response(res, 400, err.details[0].message, null);
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.log('Unhandled Error', err);
  return response(res, status, message, null);
};

export const errorMiddleware = (err, req, res, next) => {
  // Known client errors (4xx)
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  // Multer file-upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'fail',
      message: `Upload error: ${err.message}`,
    });
  }

  // Unknown / server errors (500)
  console.error('Unhandled error:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server',
  });
};

export default ErrorHandler;