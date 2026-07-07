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
  role: Joi.string().valid('super_admin', 'pilar', 'admin_sekre', 'admin_psdm', 'admin_komdigi', 'admin_advokes', 'member').required().messages({
    'any.required': 'Role harus diisi',
    'any.only': 'Role harus bernilai salah satu dari super_admin, pilar, admin_sekre, admin_psdm, admin_komdigi, admin_advokes, member'
  }),
});

export const updatePasswordUserSchema = Joi.object({
  old_password: Joi.string().required().messages({
    'any.required': 'Password lama wajib diisi',
  }),

  new_password: Joi.string().min(8).required().messages({
    'any.required': 'Password baru wajib diisi',
    'string.min': 'Password minimal 8 karakter',
  }),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().messages({
    'string.base': 'Nama harus berupa teks',
  }),

  npm: Joi.string().messages({
    'string.base': 'NPM harus berupa teks',
  }),

  division: Joi.string().messages({
    'string.base': 'Divisi harus berupa teks',
  }),

  role: Joi.string()
    .valid(
      'super_admin',
      'pilar',
      'admin_sekre',
      'admin_psdm',
      'admin_komdigi',
      'admin_advokes',
      'member'
    )
    .messages({
      'any.only':
        'Role harus bernilai salah satu dari super_admin, pilar, admin_sekre, admin_psdm, admin_komdigi, admin_advokes, member',
    }),

  password: Joi.string().min(8).messages({
    'string.min': 'Password minimal 8 karakter',
  }),
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi',
});