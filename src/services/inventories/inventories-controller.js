/* eslint-disable camelcase */
import InventoriesRepositories from './inventories-repositories.js';
import { uploadToCloudinary } from '../../utils/cloudinary.js';
import { generateAssetToken, generateQRCodeBuffer } from '../../utils/generateAssetToken.js';
import response from '../../utils/response.js';
import { nanoid } from 'nanoid';

const inventoriesRepositories = new InventoriesRepositories();

export const createInventory = async (req, res, next) => {
  try {
    const { name, description, category, quantity, location, condition, status } = req.body;

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