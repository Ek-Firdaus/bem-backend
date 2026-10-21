import pool from '../../database/pool.js';

class RolesRepositories {
  constructor() {
    this.pool = pool;
  }

  async getAllRoles() {
    const query = {
      text: 'SELECT * FROM roles',
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async getRoleById(id) {
    const query = {
      text: 'SELECT * FROM roles WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async createRole(id, name) {
    const query = {
      text: 'INSERT INTO roles (id, name) VALUES ($1, $2) RETURNING *',
      values: [id, name],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updateRole(id, name) {
    const query = {
      text: 'UPDATE roles SET name = $1 WHERE id = $2 RETURNING *',
      values: [name, id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async deleteRole(id) {
    const query = {
      text: 'DELETE FROM roles WHERE id = $1 AND is_system = false RETURNING *',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async isRoleInUse(id) {
    const query = {
      text: 'SELECT id FROM users WHERE role_id = $1 LIMIT 1',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows.length > 0;
  }

  async getPermissionsForRole(roleId) {
    const query = {
      text: `
        SELECT
          p.id,
          p.resource,
          p.action,
         
          CASE WHEN rp.permission_id IS NULL THEN false ELSE true END AS assigned
        FROM permissions p
        LEFT JOIN role_permissions rp
          ON rp.permission_id = p.id AND rp.role_id = $1
        ORDER BY p.resource ASC, p.action ASC
      `,
      values: [roleId],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async syncRolePermissions(roleId, permissionIds) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

      for (const permissionId of permissionIds) {
        await client.query(
          'INSERT INTO role_permissions (id, role_id, permission_id) VALUES ($1, $2, $3)',
          [`rp-${roleId}-${permissionId}`, roleId, permissionId]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }


};

export default RolesRepositories;

