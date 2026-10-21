import Joi from 'joi';

export const createDivisionSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nama divisi harus diisi',
    'any.required': 'Nama divisi harus diisi',
  }),
});

export const updateDivisionSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nama divisi harus diisi',
    'any.required': 'Nama divisi harus diisi',
  }),
});