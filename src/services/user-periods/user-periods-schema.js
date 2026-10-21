/* eslint-disable camelcase */
import Joi from 'joi';

export const createUserPeriodSchema = Joi.object({
  user_id: Joi.string().required().messages({
    'string.empty': 'ID pengguna tidak boleh kosong',
    'any.required': 'ID pengguna wajib diisi'
  }),
  period_id: Joi.string().required().messages({
    'string.empty': 'ID periode tidak boleh kosong',
    'any.required': 'ID periode wajib diisi'
  }),
  role_id: Joi.string().required().messages({
    'string.empty': 'ID peran tidak boleh kosong',
    'any.required': 'ID peran wajib diisi'
  }),
  division_id: Joi.string().required().messages({
    'string.empty': 'ID divisi tidak boleh kosong',
    'any.required': 'ID divisi wajib diisi'
  }),
  status: Joi.string().valid('active', 'graduated').required().messages({
    'any.only': 'Status harus salah satu dari: active, graduated',
    'any.required': 'Status wajib diisi'
  })
});

export const updateUserPeriodSchema = Joi.object({
  user_id: Joi.string().messages({
    'string.empty': 'ID pengguna tidak boleh kosong'
  }),
  period_id: Joi.string().messages({
    'string.empty': 'ID periode tidak boleh kosong'
  }),
  role_id: Joi.string().messages({
    'string.empty': 'ID peran tidak boleh kosong'
  }),
  division_id: Joi.string().messages({
    'string.empty': 'ID divisi tidak boleh kosong'
  }),
  status: Joi.string().messages({
    'string.empty': 'Status tidak boleh kosong'
  })
});
