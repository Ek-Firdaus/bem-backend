/* eslint-disable camelcase */
import Joi from 'joi';

export const createPeriodSchema = Joi.object({
  name_kabinet: Joi.string().required().messages({
    'string.empty': 'Nama kabinet tidak boleh kosong',
    'any.required': 'Nama kabinet wajib diisi'
  }),
  vision: Joi.string().required().messages({
    'string.empty': 'Visi tidak boleh kosong',
    'any.required': 'Visi wajib diisi'
  }),
  mission: Joi.string().required().messages({
    'string.empty': 'Misi tidak boleh kosong',
    'any.required': 'Misi wajib diisi'
  }),
  start_date: Joi.date().required().messages({
    'date.format': 'Format tanggal mulai tidak valid',
    'any.required': 'Tanggal mulai wajib diisi'
  }),
  end_date: Joi.date().required().messages({
    'date.format': 'Format tanggal selesai tidak valid',
    'any.required': 'Tanggal selesai wajib diisi'
  }),
  is_active: Joi.boolean().required().messages({
    'boolean.base': 'Status aktif harus berupa boolean',
    'any.required': 'Status aktif wajib diisi'
  })
});

export const updatePeriodSchema = Joi.object({
  name_kabinet: Joi.string().messages({
    'string.empty': 'Nama kabinet tidak boleh kosong'
  }),
  vision: Joi.string().messages({
    'string.empty': 'Visi tidak boleh kosong'
  }),
  mission: Joi.string().messages({
    'string.empty': 'Misi tidak boleh kosong'
  }),
  start_date: Joi.date().messages({
    'date.format': 'Format tanggal mulai tidak valid'
  }),
  end_date: Joi.date().messages({
    'date.format': 'Format tanggal selesai tidak valid'
  }),
  is_active: Joi.boolean().messages({
    'boolean.base': 'Status aktif harus berupa boolean'
  })
});