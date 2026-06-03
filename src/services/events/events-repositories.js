/* eslint-disable camelcase */
import { Pool } from 'pg';

class EventsRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async createEvent(id, name, start_time, end_time, token, is_active) {
    const query = {
      text: 'INSERT INTO events (id, name, start_time, end_time, token, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      values: [id, name, start_time, end_time, token, is_active],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getAllEvents() {
    const query = {
      text: 'SELECT * FROM events',
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async getEventById(id) {
    const query = {
      text: 'SELECT * FROM events WHERE id = $1',
      values: [id]
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updateEvent(id, { name, start_time, end_time, token, is_active }) {
    const query = {
      text: 'UPDATE events SET name = $1, start_time = $2, end_time = $3, token = $4, is_active = $5 WHERE id = $6 RETURNING *',
      values: [name, start_time, end_time, token, is_active, id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default EventsRepositories;