/* eslint-disable camelcase */
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import response from '../../utils/response.js';
import UserRepositories from './users-repositories.js';
import InvariantError from '../../exceptions/invariant-error.js';
import NotFoundError from '../../exceptions/not-found-error.js';

const userRepositories = new UserRepositories();

export const createUser = async (req, res, next) => {
  try {
    const { name, npm, password, division, role } = req.validated;

    const user = await userRepositories.verifyUser(npm);

    if (user) {
      throw new InvariantError('Pengguna sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = `user-${nanoid(16)}`;

    const newUser = await userRepositories.createUser({ id, name, npm, password: hashedPassword, division, role });

    return response(res, 201, 'Pengguna berhasil ditambahkan', newUser);

  } catch (error) {
    next(error);
  };
};

export const updatePasswordUser = async (req, res, next) => {
  try {
    const id = req.user.id;
    const { old_password, new_password } = req.validated;

    const user = await userRepositories.getUserById(id);

    const validPassword = await bcrypt.compare(old_password, user.password);

    if (!validPassword) {
      throw new InvariantError('Password lama tidak sesuai');
    }

    const isSamePassword = await bcrypt.compare(new_password, user.password);

    if (isSamePassword) {
      throw new InvariantError(
        'Password baru harus berbeda dari password lama'
      );
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await userRepositories.updatePasswordUser(id, hashedPassword);

    return response(res, 200, 'Password berhasil diperbarui');

  } catch (err) {
    next(err);
  };
};

export const getUserById = async (req, res, next) => {
  try {
    const id = req.user.id;
    const user = await userRepositories.getUserById(id);

    if (!user) {
      throw new NotFoundError('Profil tidak ditemukan');
    }

    return response(res, 200, 'Profil Berhasil ditampilkan', user);
  } catch (err) {
    next(err);
  };
};

export const getAllUser = async (req, res, next) => {
  try {
    const user = await userRepositories.getAllUser();

    return response(res, 200, 'Semua pengguna berhasil ditampilkan', { user });
  } catch (err) {
    next(err);
  };
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existUser = await userRepositories.getUserById(id);

    if (!existUser) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    const updatedData = {
      name: req.validated.name ?? existUser.name,
      npm: req.validated.npm ?? existUser.npm,
      division: req.validated.division ?? existUser.division,
      role: req.validated.role ?? existUser.role
    };

    const user = await userRepositories.updateUser(id, updatedData);

    return response(res, 200, 'Pengguna berhasil diubah', user);
  } catch (err) {
    next(err);
  };
};
