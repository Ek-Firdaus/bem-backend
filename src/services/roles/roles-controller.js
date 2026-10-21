/* eslint-disable no-undef */
/* eslint-disable camelcase */
import { nanoid } from 'nanoid';
import response from '../../utils/response.js';
import NotFoundError from '../../exceptions/not-found-error.js';
import InvariantError from '../../exceptions/invariant-error.js';
import RolesRepositories from './roles-repositories.js';
import { invalidatePermissionCache } from '../../security/permission-cache.js';

const rolesRepositories = new RolesRepositories();

export const getRoles = async (req, res, next) => {
  try {
    const roles = await rolesRepositories.getAllRoles();
    return response(res, 200, 'Role Berhasil ditampilkan', { roles });
  } catch (err) {
    next(err);
  }
};

export const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await rolesRepositories.getRoleById(id);
    if (!role) {
      throw new NotFoundError('Role tidak ditemukan');
    }
    return response(res, 200, 'Role berhasil ditampilkan', role);
  } catch (err) {
    next(err);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const { name } = req.validated;
    const id = `role-${nanoid(16)}`;

    const role = await rolesRepositories.createRole(id, name);
    return response(res, 201, 'Role berhasil ditambahkan', role);
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.validated;

    const existingRole = await rolesRepositories.getRoleById(id);
    if (!existingRole) {
      throw new NotFoundError('Role tidak ditemukan');
    }

    const updatedRole = await rolesRepositories.updateRole(id, name);
    return response(res, 200, 'Role berhasil diperbarui', updatedRole);
  } catch (err) {
    next(err);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingRole = await rolesRepositories.getRoleById(id);
    if (!existingRole) {
      throw new NotFoundError('Role tidak ditemukan');
    }

    if (existingRole.is_system === true) {
      throw new InvariantError(`Role ${existingRole.name} tidak dapat dihapus`);
    }

    const inUse = await rolesRepositories.isRoleInUse(id);
    if (inUse) {
      throw new InvariantError(`Role ${existingRole.name} masih digunakan oleh pengurus dan tidak dapat dihapus`);
    }

    await rolesRepositories.deleteRole(id);
    return response(res, 200, 'Role berhasil dihapus');
  } catch (err) {
    next(err);
  }
};

export const getRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingRole = await rolesRepositories.getRoleById(id);
    if (!existingRole) {
      throw new NotFoundError('Role tidak ditemukan');
    }

    const permissions = await rolesRepositories.getPermissionsForRole(id);
    return response(res, 200, 'Permissions berhasil ditampilkan', { permissions });
  } catch (err) {
    next(err);
  }
};

export const updateRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permission_ids } = req.validated;

    const existingRole = await rolesRepositories.getRoleById(id);
    if (!existingRole) {
      throw new NotFoundError('Role tidak ditemukan');
    }

    await rolesRepositories.syncRolePermissions(id, permission_ids);
    invalidatePermissionCache();

    const permissions = await rolesRepositories.getPermissionsForRole(id);
    return response(res, 200, 'Hak akses role berhasil diperbarui', { role: existingRole, permissions });
  } catch (err) {
    next(err);
  }
};