import { request } from './client';
import { API_PATHS } from './paths';

export const holdsApi = {
  getById: (holdId) => request('GET', API_PATHS.holdById(holdId)),

  confirm: (holdId, studentId) =>
    request('POST', API_PATHS.confirmHold(holdId), {
      studentId,
      requireStudentId: true,
    }),

  cancel: (holdId, studentId) =>
    request('DELETE', API_PATHS.holdById(holdId), {
      studentId,
      requireStudentId: true,
    }),

  getMine: (studentId) =>
    request('GET', API_PATHS.myHolds, {
      studentId,
      requireStudentId: true,
    }),
};
