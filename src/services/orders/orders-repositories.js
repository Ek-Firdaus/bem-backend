/* eslint-disable camelcase */
import pool from '../../database/pool.js';

class OrdersRepositories {
  constructor() {
    this.pool = pool;
  }

  async getBatchById(id) {
    const query = {
      text: `SELECT id, name, base_price, item_fields,
             (is_active AND NOW() BETWEEN open_at AND close_at) AS is_open
             FROM order_batches WHERE id = $1`,
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getVariantsByBatchId(batch_id) {
    const query = {
      text: 'SELECT label, extra_price FROM order_batch_variants WHERE batch_id = $1',
      values: [batch_id],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  // Pesanan, item, dan riwayat pertama disimpan dalam satu transaksi:
  // kalau salah satu gagal, semuanya dibatalkan
  async createOrder(id, batch_id, external_user_id, buyer_name, phone, total_price, notes, items, log_id) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Simpan pesanan
      await client.query({
        text: `INSERT INTO orders (id, batch_id, external_user_id, buyer_name, phone, total_price, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)`,
        values: [id, batch_id, external_user_id, buyer_name, phone, total_price, notes],
      });

      // 2. Simpan item pesanan
      for (const item of items) {
        await client.query({
          text: `INSERT INTO order_items (id, order_id, variant_label, qty, unit_price, item_data)
          VALUES ($1, $2, $3, $4, $5, $6)`,
          values: [item.id, id, item.variant_label, item.qty, item.unit_price, JSON.stringify(item.item_data)],
        });
      }

      // 3. Catat riwayat status pertama
      await client.query({
        text: `INSERT INTO order_status_logs (id, order_id, status, note, changed_by_external_id)
        VALUES ($1, $2, 'pending', 'Pesanan dibuat', $3)`,
        values: [log_id, id, external_user_id],
      });

      await client.query('COMMIT');
      return { id, status: 'pending', total_price };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getOrderById(id) {
    const query = {
      text: `SELECT o.*, b.name AS batch_name, e.email AS user_email
             FROM orders o
             JOIN order_batches b ON b.id = o.batch_id
             JOIN external_users e ON e.id = o.external_user_id
             WHERE o.id = $1`,
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getOrderItems(order_id) {
    const query = {
      text: 'SELECT variant_label, qty, unit_price, item_data FROM order_items WHERE order_id = $1',
      values: [order_id],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async getStatusLogs(order_id) {
    const query = {
      text: 'SELECT status, note, created_at FROM order_status_logs WHERE order_id = $1 ORDER BY created_at ASC',
      values: [order_id],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async getOrdersByExternalUserId(external_user_id) {
    const query = {
      text: `SELECT o.id, o.batch_id, b.name AS batch_name, o.total_price, o.status, o.rejected_reason, o.created_at
             FROM orders o
             JOIN order_batches b ON b.id = o.batch_id
             WHERE o.external_user_id = $1
             ORDER BY o.created_at DESC`,
      values: [external_user_id],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  // status dan batch_id boleh null (artinya tidak difilter)
  async getAllOrders(status, batch_id) {
    const query = {
      text: `SELECT o.id, o.batch_id, b.name AS batch_name, o.buyer_name, o.phone, o.total_price, o.status, o.created_at
             FROM orders o
             JOIN order_batches b ON b.id = o.batch_id
             WHERE ($1::varchar IS NULL OR o.status = $1)
             AND ($2::varchar IS NULL OR o.batch_id = $2)
             ORDER BY o.created_at DESC`,
      values: [status, batch_id],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  // "WHERE status = current_status" memastikan status belum berubah sejak dibaca.
  // Kalau sudah berubah, tidak ada baris yang diperbarui dan hasilnya undefined
  async updateStatus(id, status, rejected_reason, current_status) {
    const query = {
      text: `UPDATE orders
      SET status = $1::varchar,
          rejected_reason = CASE WHEN $1::varchar = 'ditolak' THEN $2 ELSE rejected_reason END,
          picked_up_at = CASE WHEN $1::varchar = 'selesai' THEN NOW() ELSE picked_up_at END,
          updated_at = NOW()
      WHERE id = $3 AND status = $4
      RETURNING id, status`,
      values: [status, rejected_reason, id, current_status],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  // Ubah status + catat riwayat dalam SATU transaksi: status dan timeline tidak mungkin berbeda
  async changeStatus(id, status, rejected_reason, current_status, log_id, note, changed_by, changed_by_external_id) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query({
        text: `UPDATE orders
        SET status = $1::varchar,
            rejected_reason = CASE WHEN $1::varchar = 'ditolak' THEN $2 ELSE rejected_reason END,
            picked_up_at = CASE WHEN $1::varchar = 'selesai' THEN NOW() ELSE picked_up_at END,
            updated_at = NOW()
        WHERE id = $3 AND status = $4
        RETURNING id, status`,
        values: [status, rejected_reason, id, current_status],
      });

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return undefined;
      }

      await client.query({
        text: `INSERT INTO order_status_logs (id, order_id, status, note, changed_by, changed_by_external_id)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        values: [log_id, id, status, note, changed_by, changed_by_external_id],
      });

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updatePaymentProof(id, payment_proof_url, payment_proof_public_id, current_status) {
    const query = {
      text: `UPDATE orders
      SET payment_proof_url = $1, payment_proof_public_id = $2,
          status = 'verifikasi_pembayaran', rejected_reason = NULL, updated_at = NOW()
      WHERE id = $3 AND status = $4
      RETURNING id, status`,
      values: [payment_proof_url, payment_proof_public_id, id, current_status],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  // Isi changed_by kalau admin yang mengubah, changed_by_external_id kalau pembeli. Salah satunya null
  async addStatusLog(id, order_id, status, note, changed_by, changed_by_external_id) {
    const query = {
      text: `INSERT INTO order_status_logs (id, order_id, status, note, changed_by, changed_by_external_id)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      values: [id, order_id, status, note, changed_by, changed_by_external_id],
    };

    await this.pool.query(query);
  }
}

export default OrdersRepositories;