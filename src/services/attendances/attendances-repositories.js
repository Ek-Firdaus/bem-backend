/* eslint-disable camelcase */
import pool from '../../database/pool.js';

class AttendancesRepositories {
  constructor() {
    this.pool = pool();
  }

  async createAttendance(id, user_id, event_id, clock_in) {
    const query = {
      text: 'INSERT INTO attendances (id, user_id, event_id, clock_in) VALUES ($1, $2, $3, $4) RETURNING *',
      values: [id, user_id, event_id, clock_in]
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  // async getAttendancesByEventId(event_id) {
  //   const query = {
  //     text: `
  //     SELECT
  //       a.id,
  //       u.name AS user_name,
  //       u.npm,
  //       e.name AS event_name,
  //       a.clock_in
  //     FROM attendances a
  //     JOIN users u ON a.user_id = u.id
  //     JOIN events e ON a.event_id = e.id
  //     WHERE a.event_id = $1
  //   `,
  //     values: [event_id]
  //   };

  //   const result = await this.pool.query(query);
  //   return result.rows;
  // }
  async getAttendancesByEventId(event_id) {
    const query = {
      text: `
     SELECT
        u.id,
        u.name AS user_name,
        u.npm,
        u.division,
        a.clock_in,
        CASE
          WHEN a.id IS NOT NULL THEN 'present'
          ELSE 'absent'
        END AS status
      FROM users u
      LEFT JOIN attendances a
        ON u.id = a.user_id
        AND a.event_id = $1
      ORDER BY
        CASE WHEN a.clock_in IS NULL THEN 1 ELSE 0 END ASC,
        u.name ASC
    `,
      values: [event_id],
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

  async getAllAttendances() {
    const query = {
      text: `
        SELECT
        u.name AS user_name,
        u.npm,
        e.name AS event_name,
        e.start_time,
        a.clock_in,
        CASE
          WHEN a.id IS NOT NULL THEN 'present'
          ELSE 'absent'
        END AS status
      FROM users u
      CROSS JOIN events e
      LEFT JOIN attendances a
        ON a.user_id = u.id
        AND a.event_id = e.id
      ORDER BY
        e.start_time DESC,
        u.name ASC
      `,
    };

    const result = await this.pool.query(query);
    return result.rows;
  }
}

export default AttendancesRepositories;