import { request } from './client';
import { API_PATHS } from './paths';

export const classesApi = {
  create: (name, totalSeats) =>
    request('POST', API_PATHS.classes, {
      body: { name, totalSeats },
    }),

  getAll: () => request('GET', API_PATHS.classes),

  getById: (classId) => request('GET', API_PATHS.classById(classId)),

  createHold: (classId, studentId) =>
    request('POST', API_PATHS.classHolds(classId), {
      studentId,
      requireStudentId: true,
    }),
};
