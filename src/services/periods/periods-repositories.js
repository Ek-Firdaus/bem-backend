/* eslint-disable camelcase */
import pool from '../../database/pool.js';

class PeriodRepositories {
  constructor() {
    this.pool = pool;
  }

  async createPeriod(id, name_kabinet, vision, mission, logo_url, logo_public_id, start_date, end_date, is_active) {
    const query = {
      text: 'INSERT INTO periods (id, name_kabinet, vision, mission, logo_url, logo_public_id, start_date, end_date, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      values: [id, name_kabinet, vision, mission, logo_url, logo_public_id, start_date, end_date, is_active],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getPeriods() {
    const query = {
      text: 'SELECT * FROM periods',
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getPeriodById(id) {
    const query = {
      text: 'SELECT * FROM periods WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updatePeriod(id, { name_kabinet, vision, mission, logo_url, logo_public_id, start_date, end_date, is_active }) {
    const query = {
      text: 'UPDATE periods SET name_kabinet = $1, vision = $2, mission = $3, logo_url = $4, logo_public_id = $5, start_date = $6, end_date = $7, is_active = $8 WHERE id = $9 RETURNING *',
      values: [name_kabinet, vision, mission, logo_url, logo_public_id, start_date, end_date, is_active, id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async deletePeriod(id) {
    const query = {
      text: 'DELETE FROM periods WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getActivePeriod() {
    const query = {
      text: 'SELECT * FROM periods WHERE is_active = true',
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async isPeriodInUse(id) {
    const query = {
      text: 'SELECT id FROM user_periods WHERE period_id = $1 LIMIT 1',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows.length > 0;
  }
}

export default PeriodRepositories;