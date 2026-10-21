import pool from '../database/pool.js';

// role_id -> Set<permission_id>
let cache = null;

async function loadFromDb() {
  const query = {
    text: 'SELECT role_id, permission_id FROM role_permissions',
  };

  const result = await pool.query(query);
  const map = new Map();

  for (const row of result.rows) {
    if (!map.has(row.role_id)) {
      map.set(row.role_id, new Set());
    }
    map.get(row.role_id).add(row.permission_id);
  }

  cache = map;
  return cache;
}

export async function hasPermission(role, permission) {
  if (!cache) {
    await loadFromDb();
  }

  return cache.get(role)?.has(permission) ?? false;
}

export function invalidatePermissionCache() {
  cache = null;
}