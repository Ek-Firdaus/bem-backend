import Joi from 'joi';

// Regex slug: huruf kecil, angka, dan strip. Tidak boleh diawali/diakhiri strip.
// const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createBlogSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).required().messages({
    'string.empty': 'Judul wajib diisi',
    'string.min': 'Judul minimal 3 karakter',
    'string.max': 'Judul maksimal 255 karakter',
  }),

  // Slug opsional saat create — kalau tidak dikirim, generate otomatis dari title di controller/service.
  // slug: Joi.string().trim().lowercase().pattern(SLUG_PATTERN).max(255).optional().messages({
  //   'string.pattern.base': 'Slug hanya boleh huruf kecil, angka, dan tanda strip (-)',
  // }),

  content: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Konten wajib diisi',
  }),

  status: Joi.string().valid('draft', 'published').default('draft'),
});

export const updateBlogSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).messages({
    'string.min': 'Judul minimal 3 karakter',
    'string.max': 'Judul maksimal 255 karakter',
  }),

  // slug: Joi.string().trim().lowercase().pattern(SLUG_PATTERN).max(255).messages({
  //   'string.pattern.base': 'Slug hanya boleh huruf kecil, angka, dan tanda strip (-)',
  // }),

  content: Joi.string().trim().min(1),

  status: Joi.string().valid('draft', 'published'),
})
  .min(1)
  .messages({
    'object.min': 'Minimal satu field harus diisi untuk update',
  });



