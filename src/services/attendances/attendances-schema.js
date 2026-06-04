/* eslint-disable camelcase */
import Joi from 'joi';

export const createAttendanceSchema = Joi.object({
  event_id: Joi.string().required().messages({
    'string.empty': 'ID acara harus diisi',
    'any.required': 'ID acara harus diisi',
  }),
  token: Joi.string().required().messages({
    'string.empty': 'Token harus diisi',
    'any.required': 'Token harus diisi',
  }),
});