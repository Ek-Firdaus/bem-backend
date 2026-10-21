/* eslint-disable camelcase */
import Joi from 'joi';

const itemSchema = Joi.object({
  variant_label: Joi.string().allow('', null),

  qty: Joi.number().integer().min(1).max(50).default(1).messages({
    'number.base': 'Jumlah harus berupa angka',
    'number.min': 'Jumlah minimal 1',
    'number.max': 'Jumlah maksimal 50 per item',
  }),

  // Isian khusus produk, mis. { nama_di_baju: 'Budi', npm: '123' }. Key-nya dicek lagi di controller
  item_data: Joi.object()
    .pattern(Joi.string(), Joi.string().trim().max(200).allow(''))
    .default({}),
});

// Sengaja tidak ada status, total_price, dan external_user_id. Semuanya ditentukan server
export const createOrderSchema = Joi.object({
  batch_id: Joi.string().required().messages({
    'string.empty': 'Batch harus diisi',
    'any.required': 'Batch harus diisi',
  }),

  buyer_name: Joi.string().trim().max(150).required().messages({
    'string.empty': 'Nama pembeli harus diisi',
    'any.required': 'Nama pembeli harus diisi',
  }),

  phone: Joi.string().trim().pattern(/^\+?[0-9]{8,15}$/).required().messages({
    'string.empty': 'Nomor telepon harus diisi',
    'any.required': 'Nomor telepon harus diisi',
    'string.pattern.base': 'Nomor telepon tidak valid',
  }),

  notes: Joi.string().trim().max(500).allow('', null).messages({
    'string.base': 'Catatan harus berupa teks',
  }),

  items: Joi.array().items(itemSchema).min(1).max(20).required().messages({
    'any.required': 'Item pesanan harus diisi',
    'array.min': 'Minimal 1 item pesanan',
    'array.max': 'Maksimal 20 item pesanan',
  }),
});

// Status yang boleh dipilih admin. 'pending' dan 'verifikasi_pembayaran' hanya terjadi lewat aksi pembeli
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('produksi', 'pengantaran', 'siap_diambil', 'selesai', 'ditolak', 'dibatalkan')
    .required()
    .messages({
      'any.only': 'Status harus salah satu dari: produksi, pengantaran, siap_diambil, selesai, ditolak, dibatalkan',
      'any.required': 'Status harus diisi',
    }),

  note: Joi.string().trim().max(500).when('status', {
    is: 'ditolak',
    then: Joi.required().messages({
      'string.empty': 'Catatan penolakan harus diisi',
      'any.required': 'Catatan penolakan harus diisi',
    }),
    otherwise: Joi.allow('', null),
  }),
});

export const getOrdersQuerySchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'verifikasi_pembayaran', 'produksi', 'pengantaran', 'siap_diambil', 'selesai', 'ditolak', 'dibatalkan')
    .messages({
      'any.only': 'Status tidak valid',
    }),

  batch_id: Joi.string(),
});