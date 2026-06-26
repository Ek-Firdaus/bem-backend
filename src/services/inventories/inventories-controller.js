/* eslint-disable camelcase */
import InventoriesRepositories from './inventories-repositories.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.js';
import { generateAssetToken, generateQRCodeBuffer } from '../../utils/generateAssetToken.js';
import { generateSingleQRPdf, generateAllQRPdf } from '../../utils/pdfGenerator.js';
import response from '../../utils/response.js';
import { nanoid } from 'nanoid';
import NotFoundError from '../../exceptions/not-found-error.js';

const inventoriesRepositories = new InventoriesRepositories();

export const createInventory = async (req, res, next) => {
  try {
    const { name, description, category, quantity, location, condition, status } = req.validated;

    const id = `inv-${nanoid(16)}`;
    let image_url = null;
    let image_public_id = null;

    if (req.file) {
      const imageUpload = await uploadToCloudinary(req.file.buffer, 'inventories');
      image_url = imageUpload.secure_url;
      image_public_id = imageUpload.public_id;
    }

    const asset_token = generateAssetToken();
    const qrBuffer = await generateQRCodeBuffer(asset_token);
    const qrUpload = await uploadToCloudinary(qrBuffer, 'qrcodes');

    const qr_url = qrUpload.secure_url;
    const qr_public_id = qrUpload.public_id;

    // 3. Simpan ke DB
    const inventory = await inventoriesRepositories.createInventory(
      id,
      name,
      description,
      category,
      quantity,
      location,
      condition,
      status,
      image_url,
      image_public_id,
      qr_url,
      qr_public_id,
      asset_token,
    );

    return response(res, 201, 'Inventaris berhasil ditambahkan', inventory);

  } catch (err) {
    next(err);
  };
};

export const updateInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingInventory = await inventoriesRepositories.getInventoryById(id);
    if (!existingInventory) {
      throw new NotFoundError('Barang tidak ditemukan');
    }

    const updatedData = {
      name: req.validated.name ?? existingInventory.name,
      description: req.validated.description ?? existingInventory.description,
      category: req.validated.category ?? existingInventory.category,
      quantity: req.validated.quantity ?? existingInventory.quantity,
      location: req.validated.location ?? existingInventory.location,
      condition: req.validated.condition ?? existingInventory.condition,
      status: req.validated.status ?? existingInventory.status,
      image_url: existingInventory.image_url,
      image_public_id: existingInventory.image_public_id,
    };

    if (req.file) {
      if (existingInventory.image_public_id) {
        await deleteFromCloudinary(existingInventory.image_public_id);
      }
      const imageUpload = await uploadToCloudinary(req.file.buffer, 'inventories');
      updatedData.image_url = imageUpload.secure_url;
      updatedData.image_public_id = imageUpload.public_id;
    }

    const inventory = await inventoriesRepositories.updateInventory(id, updatedData);

    return response(res, 200, 'Inventaris berhasil diperbarui', inventory);
  } catch (err) {
    next(err);
  }
};

export const getInventoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inventory = await inventoriesRepositories.getInventoryById(id);
    if (!inventory) {
      throw new NotFoundError('Barang tidak ditemukan');
    }

    return response(res, 200, 'Inventaris berhasil ditampilkan', inventory);
  } catch (err) {
    next(err);
  }
};

export const getAllInventories = async (req, res, next) => {
  try {
    const inventories = await inventoriesRepositories.getAllInventories();
    return response(res, 200, 'Daftar inventaris berhasil ditampilkan', { inventories });
  } catch (err) {
    next(err);
  }
};

export const deleteInvetories = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingInventory = await inventoriesRepositories.getInventoryById(id);
    if (!existingInventory) {
      throw new NotFoundError('Barang tidak ditemukan');
    }

    if (existingInventory.image_public_id) {
      await deleteFromCloudinary(existingInventory.image_public_id);
    }
    if (existingInventory.qr_public_id) {
      await deleteFromCloudinary(existingInventory.qr_public_id);
    }

    await inventoriesRepositories.deleteInventory(id);

    return response(res, 200, 'Inventaris berhasil dihapus');
  } catch (err) {
    next(err);
  };
};

export const getInventoryByToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const inventory = await inventoriesRepositories.getInventoryByToken(token);

    if (!inventory) {
      throw new NotFoundError('Barang tidak ditemukan atau token tidak valid');
    }

    return response(res, 200, 'Inventaris berhasil ditemukan', inventory);
  } catch (err) {
    next(err);
  }
};

export const updateInventoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingInventory = await inventoriesRepositories.getInventoryById(id);
    if (!existingInventory) {
      throw new NotFoundError('Barang tidak ditemukan');
    }

    const inventory = await inventoriesRepositories.updateStatus(id, status);

    return response(res, 200, 'Status inventaris berhasil diperbarui', inventory);
  } catch (err) {
    next(err);
  }
};

export const printSingleQR = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inventory = await inventoriesRepositories.getInventoryById(id);

    if (!inventory) {
      throw new NotFoundError('Barang tidak ditemukan');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=qr-${inventory.asset_token}.pdf`);

    const doc = await generateSingleQRPdf(inventory);
    doc.pipe(res);
  } catch (err) {
    next(err);
  }
};

export const printAllQR = async (req, res, next) => {
  try {
    const inventories = await inventoriesRepositories.getAllInventories();

    if (!inventories.length) {
      throw new NotFoundError('Tidak ada inventaris untuk dicetak');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=qr-semua-inventaris.pdf');

    const doc = await generateAllQRPdf(inventories);
    doc.pipe(res);
  } catch (err) {
    next(err);
  }
};