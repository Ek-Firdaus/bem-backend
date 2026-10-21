/* eslint-disable camelcase */
import { nanoid } from 'nanoid';
import pool from '../../database/pool.js';
import ConflictError from '../../exceptions/conflict-error.js';

class ExternalUsersRepositories {
  constructor() {
    this.pool = pool;
  }

  // Identitas utama = google_id (sub). Satu query atomik, aman dari race condition.
  // User baru dibuat, user lama diperbarui nama/fotonya.
  async upsertFromGoogle({ googleId, email, name, avatarUrl }) {
    const id = `ext-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO external_users (id, google_id, email, name, avatar_url)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (google_id) DO UPDATE
               SET name = EXCLUDED.name,
                   avatar_url = EXCLUDED.avatar_url,
                   updated_at = NOW()
             RETURNING id, email, name, avatar_url`,
      values: [id, googleId, email, name, avatarUrl],
    };

    try {
      const result = await this.pool.query(query);
      return result.rows[0];
    } catch (error) {
      // 23505 = unique_violation. google_id sudah ditangani ON CONFLICT,
      // jadi yang tersisa adalah email yang sudah dipakai akun Google lain.
      if (error.code === '23505') {
        throw new ConflictError('Email sudah terdaftar dengan akun lain');
      }
      throw error;
    }
  }

  async getById(id) {
    const result = await this.pool.query({
      text: 'SELECT id, email, name, avatar_url FROM external_users WHERE id = $1',
      values: [id],
    });
    return result.rows[0];
  }
}

export default ExternalUsersRepositories;
