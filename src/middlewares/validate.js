export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) return next(error);
  req.validated = value;
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });
  if (error) return next(error);
  req.validated = value;
  next();
};

// middlewares/parse-json-fields.js
import response from '../utils/response.js';

export const parseJsonFields = (fields) => (req, res, next) => {
  for (const field of fields) {
    const raw = req.body?.[field];

    if (typeof raw === 'string') {
      try {
        req.body[field] = JSON.parse(raw);
      } catch {
        return response(res, 400, `"${field}" harus berupa JSON valid`, null);
      }
    }
  }
  next();
};

// export default validate;