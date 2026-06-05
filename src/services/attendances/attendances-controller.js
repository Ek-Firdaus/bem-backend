/* eslint-disable camelcase */
import AttendancesRepositories from './attendances-repositories.js';
import EventsRepositories from '../events/events-repositories.js';
import response from '../../utils/response.js';
import InvariantError from '../../exceptions/invariant-error.js';
import { nanoid } from 'nanoid';
import ExcelJS from 'exceljs';

const attendancesRepositories = new AttendancesRepositories();
const eventRepositories = new EventsRepositories();

export const createAttendaces = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { event_id, token } = req.validated;
    const id = `attd-${nanoid(16)}`;
    const clock_in = new Date();
    const event = await eventRepositories.getEventById(event_id);

    if (clock_in < event.start_time) {
      throw new InvariantError('Presensi belum dibuka');
    }
    if (clock_in > event.end_time) {
      throw new InvariantError('Presensi sudah ditutup');
    }
    if (token !== event.token) {
      throw new InvariantError('Token yang dimasukkan salah!');
    }

    const existAttendances = await attendancesRepositories.getAttendancesByUserIdAndEventId(event_id, user_id);
    if (existAttendances) {
      throw new InvariantError('Kamu sudah melakukan Presensi');
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

    return response(res, 200, 'Presensi Berhasil ditampilkan', { attendances });
  } catch (err) {
    next(err);
  };
};

export const getAllAttendances = async (req, res, next) => {
  try {
    const attendances = await attendancesRepositories.getAllAttendances();

    return response(res, 200, 'Presensi berhasil ditampilkan', { attendances });
  } catch (err) {
    next(err);
  };
};

export const exportAttendancesByEventId = async (req, res, next) => {
  try {
    const { id: event_id } = req.params;
    const attendances = await attendancesRepositories.getAttendancesByEventId(event_id);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Presensi Acara');

    worksheet.columns = [
      { header: 'Nama', key: 'user_name', width: 30 },
      { header: 'NPM', key: 'npm', width: 15 },
      { header: 'Divisi', key: 'division', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Waktu Hadir', key: 'clock_in', width: 25 },
    ];

    attendances.forEach((attendance) => {
      worksheet.addRow({
        ...attendance,
        clock_in: attendance.clock_in
          ? new Date(attendance.clock_in).toLocaleString('id-ID')
          : '-',
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=rekap-presensi-${event_id}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  };
};

export const exportAttendances = async (req, res, next) => {
  try {
    const attendances = await attendancesRepositories.getAllAttendances();

    // 1. Susun struktur pivot
    const userMap = {};   // { user_name: { npm, Acara1: 1, Acara2: 0, ... } }
    const eventSet = new Set();

    attendances.forEach(({ user_name, npm, event_name, status }) => {
      eventSet.add(event_name);
      if (!userMap[user_name]) userMap[user_name] = { npm };
      userMap[user_name][event_name] = status === 'present' ? 1 : 0;
    });

    const events = [...eventSet];

    // 2. Buat worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rekap Presensi');

    // 3. Header dinamis
    worksheet.columns = [
      { header: 'Nama', key: 'nama', width: 25 },
      { header: 'NPM', key: 'npm', width: 15 },
      ...events.map((e) => ({ header: e, key: e, width: 15 })),
      { header: 'Total', key: 'total', width: 10 },
    ];

    // 4. Isi baris per user
    Object.entries(userMap).forEach(([name, data]) => {
      const row = { nama: name, npm: data.npm };
      let total = 0;
      events.forEach((e) => {
        row[e] = data[e] ?? 0;
        total += row[e];
      });
      row.total = total;
      const addedRow = worksheet.addRow(row);

      // Warnai kolom event
      events.forEach((e, i) => {
        const cell = addedRow.getCell(i + 3); // kolom 1=Nama, 2=NPM, 3+=event
        const isPresent = data[e] === 1;

        cell.value = isPresent ? 'Hadir' : 'Tidak Hadir';
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isPresent ? 'D6F5E3' : 'FDE8E8' },
        };
        cell.font = {
          bold: true,
          color: { argb: isPresent ? '1A7A4A' : 'C0392B' },
        };
        cell.alignment = { horizontal: 'center' };
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=rekap-presensi.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};