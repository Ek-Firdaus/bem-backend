/* eslint-disable camelcase */
import pool from '../../database/pool.js';

class InventoriesRepositories {
  constructor() {
    this.pool = pool;
  }

  async createInventory(id, name, description, category, quantity, location, condition, status, image_url, image_public_id, qr_url, qr_public_id, asset_token) {
    const query = {
      text: `INSERT INTO inventories (id, name, description, category, quantity, location, condition, status, image_url, image_public_id, qr_url, qr_public_id, asset_token) 
      VALUES ($1 , $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      values: [id, name, description, category, quantity, location, condition, status, image_url, image_public_id, qr_url, qr_public_id, asset_token]
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getInventoryById(id) {
    const query = {
      text: 'SELECT * FROM inventories WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updateInventory(id, { name, description, category, quantity, location, condition, status, image_url, image_public_id }) {
    const query = {
      text: `UPDATE inventories 
    SET name = $1, description = $2, category = $3, quantity = $4, location = $5, condition = $6, status = $7, image_url = $8, image_public_id = $9, updated_at = NOW()
    WHERE id = $10
    RETURNING *`,
      values: [name, description, category, quantity, location, condition, status, image_url, image_public_id, id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getAllInventories() {
    const query = {
      text: 'SELECT * FROM inventories',
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async getInventoryByToken(asset_token) {
    const query = {
      text: 'SELECT * FROM inventories WHERE asset_token = $1',
      values: [asset_token],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updateStatus(id, status) {
    const query = {
      text: `UPDATE inventories 
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *`,
      values: [status, id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async deleteInventory(id) {
    const query = {
      text: 'DELETE FROM inventories WHERE id = $1 RETURNING *',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}


export default InventoriesRepositories;