/* eslint-disable camelcase */
import PeriodRepositories from './periods-repositories.js';
import NotFoundError from '../../exceptions/not-found-error.js';
import InvariantError from '../../exceptions/invariant-error.js';
import response from '../../utils/response.js';
import { nanoid } from 'nanoid';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.js';

const periodRepositories = new PeriodRepositories();

export const createPeriod = async (req, res, next) => {
  try {
    const { name_kabinet, vision, mission, start_date, end_date, is_active } = req.validated;

    const id = `period-${nanoid(16)}`;

    let logo_url = null;
    let logo_public_id = null;

    if (new Date(end_date) <= new Date(start_date)) {
      throw new InvariantError('Tanggal selesai harus lebih besar dari tanggal mulai');
    }
    if (is_active) {
      const activePeriod = await periodRepositories.getActivePeriod();
      if (activePeriod) {
        throw new InvariantError('Hanya boleh ada satu periode aktif');
      }
    }

    if (req.file) {
      const logoUpload = await uploadToCloudinary(req.file.buffer, 'periods');
      logo_url = logoUpload.secure_url;
      logo_public_id = logoUpload.public_id;
    }


    const period = await periodRepositories.createPeriod(id, name_kabinet, vision, mission, logo_url, logo_public_id, start_date, end_date, is_active);
    return response(res, 201, 'Periode berhasil ditambahkan', period);
  } catch (err) {
    next(err);
  }
};

export const getPeriods = async (req, res, next) => {
  try {
    const periods = await periodRepositories.getPeriods();
    return response(res, 200, 'Periode berhasil ditampilkan', { periods });
  } catch (err) {
    next(err);
  }
};

export const getPeriodById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const period = await periodRepositories.getPeriodById(id);
    if (!period) {
      throw new NotFoundError('Periode tidak ditemukan');
    }
    return response(res, 200, 'Periode berhasil ditampilkan', period);
  } catch (err) {
    next(err);
  };
};

export const updatePeriod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name_kabinet, vision, mission, start_date, end_date, is_active } = req.validated;

    const existingPeriod = await periodRepositories.getPeriodById(id);
    if (!existingPeriod) {
      throw new NotFoundError('Periode tidak ditemukan');
    }

    const updateData = {
      name_kabinet: name_kabinet ?? existingPeriod.name_kabinet,
      vision: vision ?? existingPeriod.vision,
      mission: mission ?? existingPeriod.mission,
      logo_url: existingPeriod.logo_url,
      logo_public_id: existingPeriod.logo_public_id,
      start_date: start_date ?? existingPeriod.start_date,
      end_date: end_date ?? existingPeriod.end_date,
      is_active: is_active ?? existingPeriod.is_active
    };

    if (new Date(updateData.end_date) <= new Date(updateData.start_date)) {
      throw new InvariantError('Tanggal selesai harus lebih besar dari tanggal mulai');
    }

    if (updateData.is_active) {
      const activePeriod = await periodRepositories.getActivePeriod();
      if (activePeriod && activePeriod.id !== id) {
        throw new InvariantError('Hanya boleh ada satu periode aktif');
      }
    }


    if (req.file) {
      const logoUpload = await uploadToCloudinary(req.file.buffer, 'periods');
      updateData.logo_url = logoUpload.secure_url;
      updateData.logo_public_id = logoUpload.public_id;
      if (existingPeriod.logo_public_id) {
        await deleteFromCloudinary(existingPeriod.logo_public_id);
      }
    }

    const updatedPeriod = await periodRepositories.updatePeriod(id, updateData);
    return response(res, 200, 'Periode berhasil diperbarui', updatedPeriod);
  } catch (err) {
    next(err);
  }
};

export const deletePeriod = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingPeriod = await periodRepositories.getPeriodById(id);
    if (!existingPeriod) {
      throw new NotFoundError('Periode tidak ditemukan');
    }
    if (existingPeriod.is_active) {
      throw new InvariantError('Periode aktif gagal dihapus, silahkan nonaktifkan periode terlebih dahulu');
    }
    const isInUse = await periodRepositories.isPeriodInUse(id);
    if (isInUse) {
      throw new InvariantError('Periode gagal dihapus, periode masih digunakan oleh pengurus');
    }
    if (existingPeriod.logo_public_id) {
      await deleteFromCloudinary(existingPeriod.logo_public_id);
    }

    await periodRepositories.deletePeriod(id);
    return response(res, 200, 'Periode berhasil dihapus');
  } catch (err) {
    next(err);
  }
};