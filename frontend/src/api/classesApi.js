import { request } from './client';

export const classesApi = {
  getAll: () => request('GET', '/classes'),
  getById: (id) => request('GET', `/classes/${id}`),
  create: (name, totalSeats) => request('POST', '/classes', { name, totalSeats }),
  createHold: (classId, studentId) =>
    request('POST', `/classes/${classId}/holds`, null, studentId),
};
