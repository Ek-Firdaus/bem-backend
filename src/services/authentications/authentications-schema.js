import Joi from 'joi';

export const loginSchema = Joi.object({
  npm: Joi.string().required().messages({
    'any.required': 'NPM wajib diisi',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password wajib diisi',
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token wajib diisi',
  }),
});