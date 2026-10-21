/* eslint-disable camelcase */
import pool from '../../database/pool.js';

class UserPeriodsRepositories {
  constructor() {
    this.pool = pool;
  }

  async createUserPeriod(id, user_id, period_id, role_id, division_id, status, image_url, image_public_id) {
    const query = {
      text: 'INSERT INTO user_periods (id, user_id, period_id, role_id, division_id, status, image_url, image_public_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      values: [id, user_id, period_id, role_id, division_id, status, image_url, image_public_id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getUserPeriodById(id) {
    const query = {
      text: 'SELECT * FROM user_periods WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getUserPeriodByUserIdAndPeriodId(user_id, period_id) {
    const query = {
      text: 'SELECT * FROM user_periods WHERE user_id = $1 AND period_id = $2',
      values: [user_id, period_id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updateUserPeriod(id, { user_id, period_id, role_id, division_id, status, image_url, image_public_id }) {
    const query = {
      text: 'UPDATE user_periods SET user_id = $1, period_id = $2, role_id = $3, division_id = $4, status = $5, image_url = $6, image_public_id = $7 WHERE id = $8 RETURNING *',
      values: [user_id, period_id, role_id, division_id, status, image_url, image_public_id, id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async deleteUserPeriod(id) {
    const query = {
      text: 'DELETE FROM user_periods WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getAllUserPeriods() {
    const query = {
      text: 'SELECT * FROM user_periods',
    };
    const result = await this.pool.query(query);
    return result.rows;
  }
}

export default UserPeriodsRepositories;