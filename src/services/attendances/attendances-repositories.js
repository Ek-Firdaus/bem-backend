/* eslint-disable camelcase */
import { Pool } from 'pg';

class AttendancesRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async createAttendance(id, user_id, event_id, clock_in) {
    const query = {
      text: 'INSERT INTO attendances (id, user_id, event_id, clock_in) VALUES ($1, $2, $3, $4) RETURNING *',
      values: [id, user_id, event_id, clock_in]
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getAttendancesByEventId(event_id) {
    const query = {
      text: `
      SELECT
        a.id,
        u.name AS user_name,
        u.npm,
        e.name AS event_name,
        a.clock_in
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      JOIN events e ON a.event_id = e.id
      WHERE a.event_id = $1
    `,
      values: [event_id]
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async getAttendancesByUserId(user_id) {
    const query = {
      text: `
      SELECT a.id, a.clock_in,
        e.name AS event_name
      FROM attendances a
      JOIN events e ON a.event_id = e.id
      WHERE a.user_id = $1
      `,
      values: [user_id]
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async getAttendancesByUserIdAndEventId(event_id, user_id) {
    const query = {
      text: 'SELECT * FROM attendances WHERE user_id = $1 AND event_id = $2',
      values: [user_id, event_id]
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default AttendancesRepositories;