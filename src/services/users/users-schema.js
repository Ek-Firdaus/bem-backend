/* eslint-disable camelcase */
import Joi from 'joi';

export const createUserSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Nama wajib diisi',
  }),
  npm: Joi.string().required().messages({
    'any.required': 'NPM wajib diisi',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password wajib diisi',
  }),
  division: Joi.string().required().messages({
    'any.required': 'Divisi harus diisi'
  }),
  role: Joi.string().valid('super_admin', 'pilar', 'admin_sekre', 'admin_psdm', 'member').required().messages({
    'any.required': 'Role harus diisi',
    'any.only': 'Role harus bernilai salah satu dari super_admin, pilar, admin_sekre, admin_psdm, member'
  }),
});

export const updateUserSchema = Joi.object({
  old_password: Joi.string().required().messages({
    'any.required': 'Password lama wajib diisi',
  }),

  new_password: Joi.string().min(8).required().messages({
    'any.required': 'Password baru wajib diisi',
    'string.min': 'Password minimal 8 karakter',
  }),
});