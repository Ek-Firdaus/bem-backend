import DivisionsRepositories from './divisions-repositories.js';
import NotFoundError from '../../exceptions/not-found-error.js';
import response from '../../utils/response.js';
import { nanoid } from 'nanoid';

const divisionsRepositories = new DivisionsRepositories();

export const getAllDivisions = async (req, res, next) => {
  try {
    const divisions = await divisionsRepositories.getAllDivisions();
    return response(res, 200, 'Divisi berhasil ditampilkan', { divisions });
  } catch (err) {
    next(err);
  }
};

export const getDivisionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const division = await divisionsRepositories.getDivisionById(id);
    if (!division) {
      throw new NotFoundError('Divisi tidak ditemukan');
    }
    return response(res, 200, 'Divisi berhasil ditampilkan', division);
  } catch (err) {
    next(err);
  }
};

export const createDivision = async (req, res, next) => {
  try {
    const { name } = req.validated;
    const id = `division-${nanoid(16)}`;

    const division = await divisionsRepositories.createDivision(id, name);
    return response(res, 201, 'Divisi berhasil ditambahkan', division);
  } catch (err) {
    next(err);
  }
};

export const updateDivision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.validated;

    const existingDivision = await divisionsRepositories.getDivisionById(id);
    if (!existingDivision) {
      throw new NotFoundError('Divisi tidak ditemukan');
    }

    const updatedDivision = await divisionsRepositories.updateDivision(id, name);
    return response(res, 200, 'Divisi berhasil diperbarui', updatedDivision);
  } catch (err) {
    next(err);
  }
};

export const deleteDivision = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingDivision = await divisionsRepositories.getDivisionById(id);
    if (!existingDivision) {
      throw new NotFoundError('Divisi tidak ditemukan');
    }

    await divisionsRepositories.deleteDivision(id);
    return response(res, 200, 'Divisi berhasil dihapus');
  } catch (err) {
    next(err);
  }
};