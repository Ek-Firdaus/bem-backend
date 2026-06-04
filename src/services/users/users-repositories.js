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

  async updateUser(id, hashedPassword) {
    const query = {
      text: 'UPDATE users SET password = $1 WHERE id = $2',
      values: [hashedPassword, id]
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

};

export default UsersRepositories;