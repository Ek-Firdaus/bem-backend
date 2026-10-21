/* eslint-disable camelcase */
import OrdersRepositories from './orders-repositories.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.js';
import response from '../../utils/response.js';
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/invariant-error.js';
import NotFoundError from '../../exceptions/not-found-error.js';
import { generateRandomNumber } from '../../utils/numberGenerator.js';

const ordersRepositories = new OrdersRepositories();

// Pembeli hanya boleh upload bukti atau membatalkan saat status ini
const BUYER_EDITABLE = ['pending', 'ditolak'];

// Status yang boleh dipilih admin: dari status sekarang ke status berikutnya
const ADMIN_TRANSITIONS = {
  pending: ['dibatalkan'],
  verifikasi_pembayaran: ['produksi', 'ditolak', 'dibatalkan'],
  ditolak: ['dibatalkan'],
  produksi: ['siap_diambil'],
  siap_diambil: ['selesai'],
};

/* ---------------------------- Pembeli ---------------------------- */

export const createOrder = async (req, res, next) => {
  try {
    const { batch_id, buyer_name, phone, notes, items } = req.validated;
    const external_user_id = req.user.id;

    // 1. Cek batch
    const batch = await ordersRepositories.getBatchById(batch_id);
    if (!batch) {
      throw new NotFoundError('Batch tidak ditemukan');
    }
    if (!batch.is_open) {
      throw new InvariantError('Pre-order untuk batch ini sedang tidak dibuka');
    }

    // 2. Ambil varian batch
    const variants = await ordersRepositories.getVariantsByBatchId(batch_id);

    // 3. Cek tiap item dan hitung harga di server
    let total_price = 0;

    const orderItems = items.map((item, index) => {
      const nomor = index + 1;
      let extra_price = 0;

      if (variants.length > 0) {
        const variant = variants.find((v) => v.label === item.variant_label);
        if (!variant) {
          throw new InvariantError(`Varian pada item ke-${nomor} tidak valid`);
        }
        extra_price = variant.extra_price;
      } else if (item.variant_label) {
        throw new InvariantError(`Produk ini tidak memiliki varian (item ke-${nomor})`);
      }

      // Produk dengan isian per item (mis. nama di baju) harus satu baris per barang
      if (batch.item_fields.length > 0 && item.qty !== 1) {
        throw new InvariantError(`Item ke-${nomor}: produk ini harus dipesan satu baris per barang (qty 1)`);
      }

      // item_fields berbentuk [{ key, label, required }]. Key di luar daftar diabaikan
      const item_data = {};
      for (const field of batch.item_fields) {
        const value = item.item_data[field.key];
        if (!value) {
          if (field.required) {
            throw new InvariantError(`Isian "${field.label}" wajib diisi pada item ke-${nomor}`);
          }
          continue;
        }
        item_data[field.key] = value;
      }

      const unit_price = batch.base_price + extra_price;
      total_price += unit_price * item.qty;

      return {
        id: `itm-${nanoid(16)}`,
        variant_label: item.variant_label || null,
        qty: item.qty,
        unit_price,
        item_data,
      };
    });

    // 4. Simpan ke DB
    const id = `ORD-${generateRandomNumber(10)}`;
    const log_id = `log-${nanoid(16)}`;

    const order = await ordersRepositories.createOrder(
      id,
      batch_id,
      external_user_id,
      buyer_name,
      phone,
      total_price,
      notes || null,
      orderItems,
      log_id,
    );

    return response(res, 201, 'Pesanan berhasil dibuat', order);
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await ordersRepositories.getOrdersByExternalUserId(req.user.id);
    return response(res, 200, 'Daftar pesanan berhasil ditampilkan', { orders });
  } catch (err) {
    next(err);
  }
};

export const getMyOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await ordersRepositories.getOrderById(id);
    // Pesanan milik orang lain dijawab "tidak ditemukan" supaya id-nya tidak bisa ditebak
    if (!order || order.external_user_id !== req.user.id) {
      throw new NotFoundError('Pesanan tidak ditemukan');
    }

    const items = await ordersRepositories.getOrderItems(id);
    const logs = await ordersRepositories.getStatusLogs(id);

    return response(res, 200, 'Pesanan berhasil ditampilkan', { ...order, items, logs });
  } catch (err) {
    next(err);
  }
};

export const uploadPaymentProof = async (req, res, next) => {
  let new_public_id = null;

  try {
    const { id } = req.params;

    // 1. Cek file
    if (!req.file) {
      throw new InvariantError('Bukti pembayaran wajib diunggah');
    }

    // 2. Cek pesanan milik pembeli ini
    const order = await ordersRepositories.getOrderById(id);
    if (!order || order.external_user_id !== req.user.id) {
      throw new NotFoundError('Pesanan tidak ditemukan');
    }

    // 3. Bukti hanya boleh diunggah saat pending atau ditolak
    if (!BUYER_EDITABLE.includes(order.status)) {
      throw new InvariantError(`Bukti pembayaran tidak dapat diubah saat status "${order.status}"`);
    }

    // 4. Upload ke Cloudinary
    const upload = await uploadToCloudinary(req.file.buffer, 'payment_proofs');
    new_public_id = upload.public_id;

    // 5. Simpan ke DB
    const updated = await ordersRepositories.updatePaymentProof(
      id,
      upload.secure_url,
      upload.public_id,
      order.status,
    );
    if (!updated) {
      throw new InvariantError('Status pesanan baru saja berubah, silakan muat ulang');
    }
    new_public_id = null; // berhasil, file baru jangan dihapus

    // 6. Catat riwayat
    await ordersRepositories.addStatusLog(
      `log-${nanoid(16)}`,
      id,
      'verifikasi_pembayaran',
      'Bukti pembayaran diunggah',
      null,
      req.user.id,
    );

    // 7. Hapus bukti lama (kalau ini upload ulang setelah ditolak)
    if (order.payment_proof_public_id) {
      await deleteFromCloudinary(order.payment_proof_public_id).catch(() => { });
    }

    return response(res, 200, 'Bukti pembayaran berhasil diunggah', updated);
  } catch (err) {
    // Kalau gagal setelah upload, file yang sudah terlanjur diunggah dihapus
    if (new_public_id) {
      await deleteFromCloudinary(new_public_id).catch(() => { });
    }
    next(err);
  }
};

export const cancelMyOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await ordersRepositories.getOrderById(id);
    if (!order || order.external_user_id !== req.user.id) {
      throw new NotFoundError('Pesanan tidak ditemukan');
    }

    if (!BUYER_EDITABLE.includes(order.status)) {
      throw new InvariantError(`Pesanan tidak dapat dibatalkan saat status "${order.status}"`);
    }

    const updated = await ordersRepositories.changeStatus(
      id,
      'dibatalkan',
      null,
      order.status,
      `log-${nanoid(16)}`,
      'Dibatalkan oleh pembeli',
      null,
      req.user.id,
    );
    if (!updated) {
      throw new InvariantError('Status pesanan baru saja berubah, silakan muat ulang');
    }

    return response(res, 200, 'Pesanan berhasil dibatalkan', updated);
  } catch (err) {
    next(err);
  }
};

/* ----------------------------- Admin ----------------------------- */

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, batch_id } = req.validated;
    const orders = await ordersRepositories.getAllOrders(status ?? null, batch_id ?? null);

    return response(res, 200, 'Daftar pesanan berhasil ditampilkan', { orders });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await ordersRepositories.getOrderById(id);
    if (!order) {
      throw new NotFoundError('Pesanan tidak ditemukan');
    }

    const items = await ordersRepositories.getOrderItems(id);
    const logs = await ordersRepositories.getStatusLogs(id);

    return response(res, 200, 'Pesanan berhasil ditampilkan', { ...order, items, logs });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.validated;

    // 1. Cek pesanan
    const order = await ordersRepositories.getOrderById(id);
    if (!order) {
      throw new NotFoundError('Pesanan tidak ditemukan');
    }

    // 2. Cek apakah perpindahan status ini diperbolehkan
    const allowed = ADMIN_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      throw new InvariantError(`Status "${order.status}" tidak dapat diubah menjadi "${status}"`);
    }

    // 3. Simpan ke DB
    const updated = await ordersRepositories.changeStatus(
      id,
      status,
      note || null,
      order.status,
      `log-${nanoid(16)}`,
      note || null,
      req.user.id,
      null,
    );
    if (!updated) {
      throw new InvariantError('Status pesanan baru saja berubah, silakan muat ulang');
    }

    return response(res, 200, 'Status pesanan berhasil diperbarui', updated);
  } catch (err) {
    next(err);
  }
};