/* eslint-disable camelcase */
import Joi from 'joi';

export const createRoleSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nama role harus diisi',
    'any.required': 'Nama role harus diisi',
  }),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nama role harus diisi',
    'any.required': 'Nama role harus diisi',
  }),
});

export const updateRolePermissionsSchema = Joi.object({
  permission_ids: Joi.array().items(Joi.string()).required().messages({
    'array.base': 'Daftar permission harus berupa array',
    'any.required': 'Daftar permission wajib diisi',
  }),
});