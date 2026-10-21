import pool from '../../database/pool.js';

class DivisionsRepositories {
  constructor() {
    this.pool = pool;
  }

  async getAllDivisions() {
    const query = {
      text: 'SELECT * FROM divisions',
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getDivisionById(id) {
    const query = {
      text: 'SELECT * FROM divisions WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async createDivision(id, name) {
    const query = {
      text: 'INSERT INTO divisions (id, name) VALUES ($1, $2) RETURNING *',
      values: [id, name],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updateDivision(id, name) {
    const query = {
      text: 'UPDATE divisions SET name = $1 WHERE id = $2 RETURNING *',
      values: [name, id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async deleteDivision(id) {
    const query = {
      text: 'DELETE FROM divisions WHERE id = $1 RETURNING *',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default DivisionsRepositories;