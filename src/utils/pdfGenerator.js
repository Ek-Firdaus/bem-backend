/* eslint-disable camelcase */
import PDFDocument from 'pdfkit';
import axios from 'axios';

const CM_TO_PT = 28.3465; // 1 cm = 28.3465 pt (unit PDFKit)

const QR_SIZE = 5 * CM_TO_PT;     // 5x5 cm
const MARGIN = 1.5 * CM_TO_PT;
const GAP = 0.8 * CM_TO_PT;
const COLUMNS = 4;

const fetchImageBuffer = async (url) => {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
};

export const generateSingleQRPdf = async (inventory) => {
  const doc = new PDFDocument({ size: 'A4', margin: MARGIN });

  const x = (doc.page.width - QR_SIZE) / 2;
  const y = 150;

  try {
    const imageBuffer = await fetchImageBuffer(inventory.qr_url);
    doc.image(imageBuffer, x, y, { width: QR_SIZE, height: QR_SIZE });
  } catch (err) {
    console.error(`Gagal fetch QR untuk ${inventory.name}:`, err.message);
    doc
      .fontSize(10)
      .fillColor('red')
      .text('QR Code tidak dapat dimuat', x, y + QR_SIZE / 2, { width: QR_SIZE, align: 'center' });
    doc.fillColor('black');
  }

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(inventory.name, 0, y + QR_SIZE + 20, { align: 'center' });

  doc.end();
  return doc;
};

export const generateAllQRPdf = async (inventories) => {
  const doc = new PDFDocument({ size: 'A4', margin: MARGIN });

  const cellWidth = (doc.page.width - 2 * MARGIN - (COLUMNS - 1) * GAP) / COLUMNS;
  const cellHeight = QR_SIZE + 50;

  let col = 0;
  let y = MARGIN;

  for (const item of inventories) {
    const x = MARGIN + col * (cellWidth + GAP);

    if (y + cellHeight > doc.page.height - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }

    try {
      const imageBuffer = await fetchImageBuffer(item.qr_url);
      doc.image(imageBuffer, x, y, { width: QR_SIZE, height: QR_SIZE });
    } catch (err) {
      console.error(`Gagal fetch QR untuk ${item.name}:`, err.message);

      // Buat kotak placeholder seukuran QR agar layout tetap sejajar
      doc
        .rect(x, y, QR_SIZE, QR_SIZE)
        .lineWidth(1)
        .strokeColor('#cccccc')
        .stroke();

      doc
        .fontSize(8)
        .fillColor('red')
        .text('QR gagal dimuat', x, y + QR_SIZE / 2 - 5, {
          width: QR_SIZE,
          align: 'center',
        });
      doc.fillColor('black');
    }

    // Nama produk — selalu di posisi yang sama: tepat di bawah QR
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(item.name, x, y + QR_SIZE + 8, {
        width: QR_SIZE,
        align: 'center',
      });

    col++;
    if (col >= COLUMNS) {
      col = 0;
      y += cellHeight + GAP;
    }
  }

  doc.end();
  return doc;
};