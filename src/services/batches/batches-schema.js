/* eslint-disable camelcase */
import Joi from 'joi';

export const MAX_BATCH_IMAGES = 5;

const itemFieldSchema = Joi.object({
  key: Joi.string().trim().max(50).required(), // mis. "nama_baju", "npm"
  label: Joi.string().trim().max(100).required(), // mis. "Nama di Baju"
  required: Joi.boolean().default(true),
});

const variantSchema = Joi.object({
  label: Joi.string().trim().max(50).required(),
  extra_price: Joi.number().integer().min(0).default(0),
});

const batchFields = {
  name: Joi.string().trim().max(150).required(),
  description: Joi.string().trim().allow('', null).default(null),
  base_price: Joi.number().integer().min(0).required(),

  // Menerima array asli atau string JSON dari multipart (di-parse parseJsonFields)
  item_fields: Joi.array().items(itemFieldSchema).unique('key').default([]),

  open_at: Joi.date().iso().required(),
  close_at: Joi.date().iso().greater(Joi.ref('open_at')).required()
    .messages({ 'date.greater': 'close_at harus setelah open_at' }),

  is_active: Joi.boolean().default(true),

  // Label varian harus unik (case-insensitive)
  variants: Joi.array()
    .items(variantSchema)
    .unique((a, b) => a.label.toLowerCase() === b.label.toLowerCase())
    .default([])
    .messages({ 'array.unique': 'Label varian tidak boleh duplikat' }),
};

export const createBatchSchema = Joi.object(batchFields);

// PUT = replace penuh. keep_image_ids = id gambar lama yang dipertahankan
// (urutannya menentukan urutan tampil), gambar lain milik batch akan dihapus.
export const updateBatchSchema = Joi.object({
  ...batchFields,
  keep_image_ids: Joi.array().items(Joi.string().max(50)).unique().default([]),
});