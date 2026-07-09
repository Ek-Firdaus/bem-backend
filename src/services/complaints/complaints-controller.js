/* eslint-disable camelcase */
import ComplaintRepositories from './complaints-repositories.js';
import response from '../../utils/response.js';
import NotFoundError from '../../exceptions/not-found-error.js';
import { uploadToCloudinary } from '../../utils/cloudinary.js';
import { generateRandomNumber } from '../../utils/numberGenerator.js';

const complaintRepositories = new ComplaintRepositories();

export const createComplaint = async (req, res, next) => {
  try {
    const { is_anonymous, full_name, npm, prodi, category, title, description, suggestion, willing_to_contact, whatsapp_number, agreement } = req.body;

    const id = `COMP-${generateRandomNumber(6)}`;

    const evidences = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer, 'complaints');
        evidences.push({
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
          file_type: file.mimetype
        });
      }
    }

    const complaint = await complaintRepositories.createComplaint(
      id,
      is_anonymous,
      full_name,
      npm,
      prodi,
      category,
      title,
      description,
      suggestion,
      willing_to_contact,
      whatsapp_number,
      agreement,
      evidences
    );

    return response(res, 201, 'Pengaduan berhasil dibuat', complaint);
  } catch (err) {
    next(err);
  }
};

export const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await complaintRepositories.getAllComplaints();

    if (!complaints || complaints.length === 0) {
      throw new NotFoundError('Tidak ada pengaduan yang ditemukan');
    }

    return response(res, 200, 'Berhasil mendapatkan semua pengaduan', complaints);
  } catch (err) {
    next(err);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await complaintRepositories.getComplaintById(id);

    if (!complaint) {
      throw new NotFoundError(`Pengaduan dengan ID ${id} tidak ditemukan`);
    }

    return response(res, 200, 'Berhasil mendapatkan pengaduan', complaint);
  } catch (err) {
    next(err);
  }
};

export const updateComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const complaint = await complaintRepositories.getComplaintById(id);

    if (!complaint) {
      throw new NotFoundError(`Pengaduan dengan ID ${id} tidak ditemukan`);
    }
    const updatedComplaint = await complaintRepositories.updateStatusComplaintById(id, status);

    if (!updatedComplaint) {
      throw new NotFoundError(`Pengaduan dengan ID ${id} tidak ditemukan`);
    }

    return response(res, 200, 'Berhasil memperbarui pengaduan', updatedComplaint);
  } catch (err) {
    next(err);
  }
};