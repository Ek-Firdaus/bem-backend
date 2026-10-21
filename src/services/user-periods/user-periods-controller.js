/* eslint-disable camelcase */
import { nanoid } from 'nanoid';
import UserPeriodsRepositories from './user-periods-repositories.js';
import InvariantError from '../../exceptions/invariant-error.js';
import NotFoundError from '../../exceptions/not-found-error.js';
import response from '../../utils/response.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.js';

const userPeriodsRepositories = new UserPeriodsRepositories();


export const createUserPeriod = async (req, res, next) => {
  try {
    const { user_id, period_id, role_id, division_id, status } = req.validated;

    const id = `user-period-${nanoid(16)}`;

    const checkUserPeriod = await userPeriodsRepositories.getUserPeriodByUserIdAndPeriodId(user_id, period_id);
    if (checkUserPeriod) {
      throw new InvariantError('Pengguna sudah terdaftar pada periode ini');
    }

    let image_url = null;
    let image_public_id = null;

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer, 'user-periods');
      image_url = uploaded.secure_url;
      image_public_id = uploaded.public_id;
    }

    const userPeriod = await userPeriodsRepositories.createUserPeriod(
      id,
      user_id,
      period_id,
      role_id,
      division_id,
      status,
      image_url,
      image_public_id
    );

    return response(res, 201, 'Pengguna periode berhasil dibuat', userPeriod);
  } catch (err) {
    next(err);
  }
};

export const updateUserPeriod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingUserPeriod = await userPeriodsRepositories.getUserPeriodById(id);
    if (!existingUserPeriod) {
      throw new NotFoundError('Pengguna periode tidak ditemukan');
    }

    const updatedData = {
      user_id: req.validated.user_id ?? existingUserPeriod.user_id,
      period_id: req.validated.period_id ?? existingUserPeriod.period_id,
      role_id: req.validated.role_id ?? existingUserPeriod.role_id,
      division_id: req.validated.division_id ?? existingUserPeriod.division_id,
      status: req.validated.status ?? existingUserPeriod.status,
      image_url: existingUserPeriod.image_url,
      image_public_id: existingUserPeriod.image_public_id
    };


    if (req.file) {
      if (updatedData.image_public_id) {
        await deleteFromCloudinary(updatedData.image_public_id);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, 'user-periods');
      updatedData.image_url = uploaded.secure_url;
      updatedData.image_public_id = uploaded.public_id;
    }

    const updatedUserPeriod = await userPeriodsRepositories.updateUserPeriod(id, updatedData);
    return response(res, 200, 'Pengguna periode berhasil diperbarui', updatedUserPeriod);
  } catch (err) {
    next(err);
  }
};

export const getAllUserPeriods = async (req, res, next) => {
  try {
    const userPeriods = await userPeriodsRepositories.getAllUserPeriods();
    return response(res, 200, 'Daftar pengguna periode berhasil diambil', { userPeriods });
  } catch (err) {
    next(err);
  }
};

export const getUserPeriodById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userPeriod = await userPeriodsRepositories.getUserPeriodById(id);
    if (!userPeriod) {
      throw new NotFoundError('Pengguna periode tidak ditemukan');
    }
    return response(res, 200, 'Pengguna periode berhasil diambil', userPeriod);
  } catch (err) {
    next(err);
  }
};

export const deleteUserPeriod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingUserPeriod = await userPeriodsRepositories.getUserPeriodById(id);
    if (!existingUserPeriod) {
      throw new NotFoundError('Pengguna periode tidak ditemukan');
    }

    if (existingUserPeriod.image_public_id) {
      await deleteFromCloudinary(existingUserPeriod.image_public_id);
    }

    await userPeriodsRepositories.deleteUserPeriod(id);
    return response(res, 200, 'Pengguna periode berhasil dihapus');
  } catch (err) {
    next(err);
  }
};
