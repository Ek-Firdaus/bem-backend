import pool from '../../database/pool.js';
import InvariantError from '../../exceptions/invariant-error.js';

class AuthRepositories {
  constructor() {
    this.pool = pool;
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications (token) VALUES ($1)',
      values: [token],
    };
    await this.pool.query(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this.pool.query(query);
    if (result.rowCount === 0) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1 RETURNING token',
      values: [token],
    };

    const result = await this.pool.query(query);
    if (result.rowCount === 0) {
      throw new InvariantError('Refresh token gagal dihapus. Token tidak ditemukan');
    }
  }
}

export default AuthRepositories;
