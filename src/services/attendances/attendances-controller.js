/* eslint-disable camelcase */
import AttendancesRepositories from './attendances-repositories.js';
import EventsRepositories from '../events/events-repositories.js';
import response from '../../utils/response.js';
import InvariantError from '../../exceptions/invariant-error.js';
import { nanoid } from 'nanoid';

const attendancesRepositories = new AttendancesRepositories();
const eventRepositories = new EventsRepositories();

export const createAttendaces = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { event_id } = req.validated;
    const id = `attd-${nanoid(16)}`;
    const clock_in = new Date();
    const event = await eventRepositories.getEventById(event_id);

    if (clock_in < event.start_time) {
      throw new InvariantError('Presensi belum dibuka');
    }
    if (clock_in > event.end_time) {
      throw new InvariantError('Presensi sudah ditutup');
    }

    const attendances = await attendancesRepositories.createAttendance(id, user_id, event_id, clock_in);

    return response(res, 201, 'Presensi berhasil dicatat', attendances);

  } catch (err) {
    next(err);
  };
};

export const getAttendancesByEventId = async (req, res, next) => {
  try {
    const { id: event_id } = req.params;
    const attendances = await attendancesRepositories.getAttendancesByEventId(event_id);

    return response(res, 200, 'Presensi Berhasil ditampilkan', { attendances });
  } catch (err) {
    next(err);
  };
};

export const getAttendancesByUserId = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const attendances = await attendancesRepositories.getAttendancesByUserId(user_id);

    return response(res, 200, 'Prensensi Berhasil ditampilkan', { attendances });
  } catch (err) {
    next(err);
  };
};

