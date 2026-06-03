/* eslint-disable camelcase */
import Joi from 'joi';

export const createEventSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nama acara harus diisi',
    'any.required': 'Nama acara harus diisi',
  }),

  start_time: Joi.date().required().messages({
    'date.base': 'Waktu mulai harus berupa tanggal dan waktu yang valid',
    'any.required': 'Waktu mulai harus diisi',
  }),

  end_time: Joi.date().greater(Joi.ref('start_time')).required().messages({
    'date.base': 'Waktu selesai harus berupa tanggal dan waktu yang valid',
    'date.greater': 'Waktu selesai harus lebih besar dari waktu mulai',
    'any.required': 'Waktu selesai harus diisi',
  }),

  is_active: Joi.boolean().required().messages({
    'boolean.base': 'Status aktif harus berupa true atau false',
    'any.required': 'Status aktif harus diisi',
  }),
});

export const updateEventSchema = Joi.object({
  name: Joi.string(),

  start_time: Joi.date().messages({
    'date.base': 'Waktu mulai harus berupa tanggal dan waktu yang valid',
  }),

  end_time: Joi.date().messages({
    'date.base': 'Waktu selesai harus berupa tanggal dan waktu yang valid',
  }),

  is_active: Joi.boolean().messages({
    'boolean.base': 'Status aktif harus berupa true atau false',
  }),
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi',
});;