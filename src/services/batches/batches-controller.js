/* eslint-disable camelcase */
import { nanoid } from 'nanoid';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.js';
import response from '../../utils/response.js';
import BatchesRepositories from './batches-repositories.js';
import NotFoundError from '../../exceptions/not-found-error.js';
import InvariantError from '../../exceptions/invariant-error.js';
import { MAX_BATCH_IMAGES } from './batches-schema.js';

const batchesRepositories = new BatchesRepositories();

export const createBatch = async (req, res, next) => {
  const images = [];
  try {
    const { name, description, base_price, item_fields, open_at, close_at, is_active, variants } = req.validated;

    const id = `batch-${nanoid(16)}`;

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer, 'batches');
        images.push({
          image_url: uploaded.secure_url,
          image_public_id: uploaded.public_id
        });
      }
    }
    // 3. Simpan ke DB
    const batch = await batchesRepositories.createBatch(
      id,
      name,
      description,
      base_price,
      item_fields,
      open_at,
      close_at,
      is_active,
      variants,
      images,
    );

    return response(res, 201, 'Batch berhasil ditambahkan', batch);

  } catch (err) {
    if (images.length > 0) {
      await Promise.allSettled(images.map((img) => deleteFromCloudinary(img.image_public_id)));
    }
    next(err);
  };
};

export const updateBatch = async (req, res, next) => {
  let newImages = [];
  try {
    const { id } = req.params;
    const { name, description, base_price, item_fields, open_at, close_at, is_active, variants, keep_image_ids } = req.validated;

    const existingBatch = await batchesRepositories.getBatchById(id);

    if (!existingBatch) {
      throw new NotFoundError(`Batch dengan ID ${id} tidak ditemukan`);
    }

    // keep_image_ids hanya boleh berisi gambar milik batch ini
    const existingImageIds = existingBatch.images.map((img) => img.id);

    if (keep_image_ids.some((imageId) => !existingImageIds.includes(imageId))) {
      throw new InvariantError('keep_image_ids berisi gambar yang bukan milik batch ini');
    }

    const files = req.files ?? [];

    if (keep_image_ids.length + files.length > MAX_BATCH_IMAGES) {
      throw new InvariantError(`Maksimal ${MAX_BATCH_IMAGES} gambar per batch`);
    }

    for (const file of files) {
      const uploaded = await uploadToCloudinary(file.buffer, 'batches');
      newImages.push({
        image_url: uploaded.secure_url,
        image_public_id: uploaded.public_id
      });
    }

    const isUpdated = await batchesRepositories.updateBatch(
      id,
      name,
      description,
      base_price,
      item_fields,
      open_at,
      close_at,
      is_active,
      variants,
      keep_image_ids,
      newImages
    );

    if (!isUpdated) {
      throw new NotFoundError(`Batch dengan ID ${id} tidak ditemukan`);
    }

    // DB sudah commit, gambar baru sekarang dipakai DB jadi jangan ikut dibersihkan di catch
    newImages = [];

    // Gambar lama yang tidak dipertahankan dihapus dari Cloudinary setelah DB berhasil
    const removedImages = existingBatch.images.filter((img) => !keep_image_ids.includes(img.id));
    await Promise.allSettled(removedImages.map((img) => deleteFromCloudinary(img.image_public_id)));

    const updatedBatch = await batchesRepositories.getBatchById(id);

    return response(res, 200, 'Batch berhasil diperbarui', updatedBatch);
  } catch (err) {
    if (newImages.length > 0) {
      await Promise.allSettled(newImages.map((img) => deleteFromCloudinary(img.image_public_id)));
    }
    next(err);
  }
};

export const deleteBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingBatch = await batchesRepositories.getBatchById(id);

    if (!existingBatch) {
      throw new NotFoundError(`Batch dengan ID ${id} tidak ditemukan`);
    }

    const isInUse = await batchesRepositories.isBatchInUse(id);

    if (isInUse) {
      throw new InvariantError('Batch tidak dapat dihapus karena sudah memiliki order');
    }

    // DB dulu, baru Cloudinary
    await batchesRepositories.deleteBatch(id);
    await Promise.allSettled(existingBatch.images.map((img) => deleteFromCloudinary(img.image_public_id)));

    return response(res, 200, 'Batch berhasil dihapus');
  } catch (err) {
    // Order masuk persis di antara pengecekan dan delete (FK RESTRICT dari orders)
    if (err.code === '23503') {
      return next(new InvariantError('Batch tidak dapat dihapus karena sudah memiliki order'));
    }
    next(err);
  }
};

// export const updateBatch = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const existingBatch = await batchesRepositories.getBatchById(id);

//     if (!existingBatch) {
//       throw new NotFoundError('Batch tidak ditemukan');
//     }

//     const { name, description, base_price, item_fields, open_at, close_at, is_active } = req.validated;

//     let image_url = existingBatch.image_url;
//     let image_public_id = existingBatch.image_public_id;

//     if (req.file) {
//       // Hapus gambar lama dari Cloudinary jika ada
//       if (image_public_id) {
//         await deleteFromCloudinary(image_public_id);
//       }
//       const imageUpload = await uploadToCloudinary(req.file.buffer, 'batches');
//       image_url = imageUpload.secure_url;
//       image_public_id = imageUpload.public_id;
//     }

//     // 3. Update ke DB
//     const updatedBatch = await batchesRepositories.updateBatch(
//       id,
//       name ?? existingBatch.name,
//       description ?? existingBatch.description,
//       base_price ?? existingBatch.base_price,
//       item_fields ?? existingBatch.item_fields,
//       open_at ?? existingBatch.open_at,
//       close_at ?? existingBatch.close_at,
//       is_active ?? existingBatch.is_active,
//       image_url,
//       image_public_id,
//     );

//     return response(res, 200, 'Batch berhasil diperbarui', updatedBatch);

//   } catch (err) {
//     next(err);
//   };
// };

// export const deleteBatch = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const existingBatch = await batchesRepositories.getBatchById(id);

//     if (!existingBatch) {
//       throw new NotFoundError('Batch tidak ditemukan');
//     }

//     // Hapus gambar dari Cloudinary jika ada
//     if (existingBatch.image_public_id) {
//       await deleteFromCloudinary(existingBatch.image_public_id);
//     }

//     // Hapus batch dari DB
//     await batchesRepositories.deleteBatch(id);

//     return response(res, 200, 'Batch berhasil dihapus');

//   } catch (err) {
//     next(err);
//   };
// };

export const getBatchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const batch = await batchesRepositories.getBatchById(id);

    if (!batch) {
      throw new NotFoundError('Batch tidak ditemukan');
    }

    return response(res, 200, 'Berhasil mengambil data batch', batch);

  } catch (err) {
    next(err);
  };
};

export const getAllBatches = async (req, res, next) => {
  try {
    const batches = await batchesRepositories.getAllBatches();
    return response(res, 200, 'Berhasil mengambil semua batch', batches);
  } catch (err) {
    next(err);
  }
};

