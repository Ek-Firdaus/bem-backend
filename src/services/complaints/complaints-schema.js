/* eslint-disable camelcase */
import Joi from 'joi';

const PRODI_OPTIONS = ['Teknik Informatika', 'Sistem Informasi'];

const CATEGORY_OPTIONS = [
  'Akademik',
  'Fasilitas',
  'Kemahasiswaan',
  'Organisasi',
  'Kesehatan Mental',
  'Kekerasan di Lingkungan Kampus',
  'Lainnya',
];

// Field boolean dikirim via multipart/form-data, jadi datang sebagai string "true"/"false"
const booleanFromForm = () => Joi.boolean().truthy('true').falsy('false');

export const createComplaintSchema = Joi.object({
  is_anonymous: booleanFromForm().required().messages({
    'any.required': 'Status pengirim (anonim atau tidak) wajib diisi',
  }),

  // Wajib diisi HANYA kalau is_anonymous = false
  full_name: Joi.string().trim().min(3).max(255).when('is_anonymous', {
    is: false,
    then: Joi.required(),
    otherwise: Joi.optional().allow('', null),
  }).messages({
    'string.empty': 'Nama lengkap wajib diisi',
    'any.required': 'Nama lengkap wajib diisi jika tidak anonim',
  }),

  npm: Joi.string().trim().pattern(/^[0-9]+$/).min(5).max(20).when('is_anonymous', {
    is: false,
    then: Joi.required(),
    otherwise: Joi.optional().allow('', null),
  }).messages({
    'string.pattern.base': 'NPM hanya boleh berisi angka',
    'any.required': 'NPM wajib diisi jika tidak anonim',
  }),

  prodi: Joi.string().valid(...PRODI_OPTIONS).required().messages({
    'any.only': `Program studi harus salah satu dari: ${PRODI_OPTIONS.join(', ')}`,
    'any.required': 'Program studi wajib diisi',
  }),

  category: Joi.string().valid(...CATEGORY_OPTIONS).required().messages({
    'any.only': `Kategori aspirasi harus salah satu dari: ${CATEGORY_OPTIONS.join(', ')}`,
    'any.required': 'Kategori aspirasi wajib diisi',
  }),

  title: Joi.string().trim().min(5).max(255).required().messages({
    'string.empty': 'Judul aspirasi wajib diisi',
    'string.min': 'Judul aspirasi minimal 5 karakter',
  }),

  description: Joi.string().trim().min(10).required().messages({
    'string.empty': 'Isi aspirasi wajib diisi',
    'string.min': 'Isi aspirasi minimal 10 karakter, jelaskan secara kronologis',
  }),

  suggestion: Joi.string().trim().allow('', null).optional(),

  willing_to_contact: booleanFromForm().required().messages({
    'any.required': 'Kesediaan untuk dihubungi wajib diisi',
  }),

  // Wajib diisi HANYA kalau willing_to_contact = true
  whatsapp_number: Joi.string().trim().pattern(/^[0-9+]+$/).min(9).max(20).when('willing_to_contact', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional().allow('', null),
  }).messages({
    'string.pattern.base': 'Nomor WhatsApp tidak valid',
    'any.required': 'Nomor WhatsApp wajib diisi jika bersedia dihubungi',
  }),

  agreement: booleanFromForm().valid(true).required().messages({
    'any.only': 'Anda harus menyetujui pernyataan sebelum mengirim aspirasi',
    'any.required': 'Persetujuan wajib dicentang',
  }),
});

// Untuk PATCH /complaints/:id/status (admin)
export const updateComplaintStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'on progress', 'done').required().messages({
    'any.only': `Status harus salah satu dari: ${['pending', 'on progress', 'done'].join(', ')}`,
    'any.required': 'Status wajib diisi',
  }),
});