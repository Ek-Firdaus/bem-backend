/* eslint-disable camelcase */
import Joi from 'joi';

export const createInventorySchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nama barang harus diisi',
    'any.required': 'Nama barang harus diisi',
  }),

  description: Joi.string().allow('', null).messages({
    'string.base': 'Deskripsi harus berupa teks',
  }),

  category: Joi.string().allow('', null).messages({
    'string.base': 'Kategori harus berupa teks',
  }),

  quantity: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Jumlah harus berupa angka',
    'number.integer': 'Jumlah harus berupa bilangan bulat',
    'number.min': 'Jumlah minimal 1',
  }),

  location: Joi.string().allow('', null).messages({
    'string.base': 'Lokasi harus berupa teks',
  }),

  condition: Joi.string()
    .valid('good', 'minor_damage', 'damaged', 'lost')
    .default('good')
    .messages({
      'any.only': 'Kondisi harus salah satu dari: good, minor_damage, damaged, lost',
    }),

  status: Joi.string()
    .valid('available', 'borrowed', 'maintenance')
    .default('available')
    .messages({
      'any.only': 'Status harus salah satu dari: available, borrowed, maintenance',
    }),
});

export const updateInventorySchema = Joi.object({
  name: Joi.string().messages({
    'string.empty': 'Nama barang harus diisi',
  }),

  description: Joi.string().allow('', null),

  category: Joi.string().allow('', null),

  quantity: Joi.number().integer().min(1).messages({
    'number.base': 'Jumlah harus berupa angka',
    'number.integer': 'Jumlah harus berupa bilangan bulat',
    'number.min': 'Jumlah minimal 1',
  }),

  location: Joi.string().allow('', null),

  condition: Joi.string()
    .valid('good', 'minor_damage', 'damaged', 'lost')
    .messages({
      'any.only': 'Kondisi harus salah satu dari: good, minor_damage, damaged, lost',
    }),

  status: Joi.string()
    .valid('available', 'borrowed', 'maintenance')
    .messages({
      'any.only': 'Status harus salah satu dari: available, borrowed, maintenance',
    }),
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi',
});