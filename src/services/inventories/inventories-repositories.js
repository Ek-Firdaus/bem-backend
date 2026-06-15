/* eslint-disable camelcase */
import { Pool } from 'pg';

class InventoriesRepositories {
  constructor() {
    this.pool = new Pool();
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
}


export default InventoriesRepositories;