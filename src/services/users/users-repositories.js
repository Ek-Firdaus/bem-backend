import { Pool } from 'pg';

class UsersRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async verifyUser(npm) {
    const query = {
      text: 'SELECT * FROM users WHERE npm = $1',
      values: [npm],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async createUser({ id, name, npm, password, role, division }) {
    const query = {
      text: 'INSERT INTO users (id, name, npm, password, division, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, name, npm, password, division, role],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getUserById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id]
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updatePasswordUser(id, hashedPassword) {
    const query = {
      text: 'UPDATE users SET password = $1 WHERE id = $2',
      values: [hashedPassword, id]
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getAllUser() {
    const query = {
      text: 'SELECT id, name, npm, division, role FROM users',
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async updateUser(id, { name, npm, division, role }) {
    const query = {
      text: 'UPDATE users SET name = $1, npm = $2, division = $3, role = $4 WHERE id = $5 RETURNING name, npm, division, role',
      values: [name, npm, division, role, id]
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

};

export default UsersRepositories;