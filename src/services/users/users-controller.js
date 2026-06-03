import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import response from '../../utils/response.js';
import UserRepositories from './users-repositories.js';
import InvariantError from '../../exceptions/invariant-error.js';

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