import QRCode from 'qrcode';
import { nanoid } from 'nanoid';

export const generateAssetToken = () => {
  return `BEM-FTI-${nanoid(8).toUpperCase()}`; // e.g. BEM-A1B2C3D4
};

export const generateQRCodeBuffer = async (token) => {
  // Return sebagai buffer PNG agar bisa langsung diupload ke Cloudinary
  return await QRCode.toBuffer(token, {
    type: 'png',
    width: 300,
    margin: 2,
    color: {
      dark: '#1E3A5F',  // Navy — warna tema SIM-BEM
      light: '#FFFFFF',
    },
  });
};