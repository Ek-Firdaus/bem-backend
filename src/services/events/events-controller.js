/* eslint-disable camelcase */
import EventsRepositories from './events-repositories.js';
import InvariantError from '../../exceptions/invariant-error.js';
import NotFoundError from '../../exceptions/not-found-error.js';
import response from '../../utils/response.js';
import { nanoid } from 'nanoid';

const eventsRepositories = new EventsRepositories();

export const createEvent = async (req, res, next) => {
  try {
    const { name, start_time, end_time, is_active } = req.validated;

    const id = `event-${nanoid(16)}`;
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    const event = await eventsRepositories.createEvent(id, name, start_time, end_time, token, is_active);

    return response(res, 201, 'Event berhasil dibuat', event);

  } catch (err) {
    next(err);
  };
};

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventsRepositories.getAllEvents();

    return response(res, 200, 'Acara berhasil ditampilkan', { events });
  } catch (err) {
    next(err);
  };
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingEvent = await eventsRepositories.getEventById(id);
    if (!existingEvent) {
      throw new NotFoundError('Acara tidak ditemukan');
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();

    const updatedData = {
      name: req.validated.name ?? existingEvent.name,
      start_time: req.validated.start_time ?? existingEvent.start_time,
      end_time: req.validated.end_time ?? existingEvent.end_time,
      token: token,
      is_active: req.validated.is_active ?? existingEvent.is_active
    };

    if (new Date(updatedData.end_time) <= new Date(updatedData.start_time)) {
      throw new InvariantError(
        'Waktu selesai harus lebih besar dari waktu mulai'
      );
    }

    const event = await eventsRepositories.updateEvent(id, updatedData);

    return response(res, 200, 'Acara berhasil diperbarui', event);
  } catch (err) {
    next(err);
  };
};

export const getDetailEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventsRepositories.getEventById(id);
    if (!event) {
      throw new NotFoundError('Acara tidak ditemukan');
    }

    return response(res, 200, 'Acara berhasil ditampilkan', event);
  } catch (err) {
    next(err);
  };
};