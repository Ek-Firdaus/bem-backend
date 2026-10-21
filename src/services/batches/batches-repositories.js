/* eslint-disable camelcase */
import pool from '../../database/pool.js';
import { nanoid } from 'nanoid';

const insertVariants = async (client, batchId, variants) => {
  const inserted = [];

  for (const [index, variant] of variants.entries()) {
    const result = await client.query({
      text: `INSERT INTO order_batch_variants (id, batch_id, label, extra_price, sort_order)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values: [`variant-${nanoid(16)}`, batchId, variant.label, variant.extra_price ?? 0, index],
    });
    inserted.push(result.rows[0]);
  }

  return inserted;
};

// startAt = urutan pertama untuk gambar baru (setelah gambar lama yang dipertahankan)
const insertImages = async (client, batchId, images, startAt = 0) => {
  const inserted = [];

  for (const [index, image] of images.entries()) {
    const result = await client.query({
      text: `INSERT INTO order_batch_images (id, batch_id, image_url, image_public_id, sort_order)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values: [`image-${nanoid(16)}`, batchId, image.image_url, image.image_public_id, startAt + index],
    });
    inserted.push(result.rows[0]);
  }

  return inserted;
};

class BatchesRepositories {
  constructor() {
    this.pool = pool;
  }

  async createBatch(id, name, description, base_price, item_fields, open_at, close_at, is_active, variants, images) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const batchResult = await client.query({
        text: `INSERT INTO order_batches (id, name, description, base_price, item_fields, open_at, close_at, is_active)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        values: [id, name, description, base_price, JSON.stringify(item_fields), open_at, close_at, is_active],
      });

      const insertedVariants = await insertVariants(client, id, variants);
      const insertedImages = await insertImages(client, id, images);

      await client.query('COMMIT');
      return { ...batchResult.rows[0], variants: insertedVariants, images: insertedImages };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // PUT / replace penuh: field batch ditimpa, varian di-replace, gambar di-sync.
  // Return false kalau batch tidak ditemukan.
  async updateBatch(id, name, description, base_price, item_fields, open_at, close_at, is_active, variants, keepImageIds, newImages) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const updated = await client.query({
        text: `UPDATE order_batches
               SET name = $2, description = $3, base_price = $4, item_fields = $5::jsonb,
                   open_at = $6, close_at = $7, is_active = $8, updated_at = NOW()
               WHERE id = $1`,
        values: [id, name, description, base_price, JSON.stringify(item_fields), open_at, close_at, is_active],
      });

      if (updated.rowCount === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      // Aman di-replace: order_items menyimpan variant_label sebagai teks, bukan FK
      await client.query({ text: 'DELETE FROM order_batch_variants WHERE batch_id = $1', values: [id] });
      await insertVariants(client, id, variants);

      // Gambar yang tidak dipertahankan dihapus dari DB
      await client.query({
        text: 'DELETE FROM order_batch_images WHERE batch_id = $1 AND NOT (id = ANY($2::text[]))',
        values: [id, keepImageIds],
      });

      // Unique (batch_id, sort_order) dicek per baris, jadi urutan lama "diparkir"
      // ke nilai negatif dulu sebelum diberi urutan baru
      await client.query({
        text: 'UPDATE order_batch_images SET sort_order = -sort_order - 1 WHERE batch_id = $1',
        values: [id],
      });

      for (const [index, imageId] of keepImageIds.entries()) {
        await client.query({
          text: 'UPDATE order_batch_images SET sort_order = $3 WHERE id = $1 AND batch_id = $2',
          values: [imageId, id, index],
        });
      }

      await insertImages(client, id, newImages, keepImageIds.length);

      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async isBatchInUse(id) {
    const result = await this.pool.query({
      text: 'SELECT EXISTS (SELECT 1 FROM orders WHERE batch_id = $1) AS in_use',
      values: [id],
    });
    return result.rows[0].in_use;
  }

  // Varian dan gambar ikut terhapus lewat ON DELETE CASCADE
  async deleteBatch(id) {
    const result = await this.pool.query({
      text: 'DELETE FROM order_batches WHERE id = $1',
      values: [id],
    });
    return result.rowCount > 0;
  }

  async getBatchById(id) {
    const query = {
      text: `
      SELECT
        b.id, b.name, b.description, b.base_price, b.item_fields,
        b.open_at, b.close_at, b.is_active, b.created_at,
        COALESCE((
          SELECT json_agg(
            json_build_object('id', v.id, 'label', v.label, 'extra_price', v.extra_price)
            ORDER BY v.sort_order
          )
          FROM order_batch_variants v WHERE v.batch_id = b.id
        ), '[]') AS variants,
        COALESCE((
          SELECT json_agg(
            json_build_object('id', i.id, 'image_url', i.image_url, 'image_public_id', i.image_public_id)
            ORDER BY i.sort_order
          )
          FROM order_batch_images i WHERE i.batch_id = b.id
        ), '[]') AS images
      FROM order_batches b
      WHERE b.id = $1`,
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0] ?? null;
  }

  async getAllBatches({ onlyActive = false } = {}) {
    const query = {
      text: `
      SELECT
        b.id, b.name, b.base_price, b.open_at, b.close_at,
        (SELECT i.image_url
           FROM order_batch_images i
          WHERE i.batch_id = b.id
          ORDER BY i.sort_order
          LIMIT 1) AS thumbnail,
        b.base_price + COALESCE(
          (SELECT MAX(v.extra_price)
             FROM order_batch_variants v
            WHERE v.batch_id = b.id), 0
        ) AS max_price,
        CASE
          WHEN NOT b.is_active THEN 'inactive'
          WHEN NOW() < b.open_at THEN 'upcoming'
          WHEN NOW() > b.close_at THEN 'closed'
          ELSE 'open'
        END AS status
      FROM order_batches b
      ${onlyActive ? 'WHERE b.is_active = true' : ''}
      ORDER BY b.open_at DESC`,
    };

    const result = await this.pool.query(query);
    return result.rows;
  }
}

export default BatchesRepositories;