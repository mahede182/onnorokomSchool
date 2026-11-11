import { request } from './client';

export const holdsApi = {
  getById: (holdId) => request('GET', `/holds/${holdId}`),
  confirm: (holdId, studentId) =>
    request('POST', `/holds/${holdId}/confirm`, null, studentId),
  cancel: (holdId, studentId) =>
    request('DELETE', `/holds/${holdId}`, null, studentId),
  getMine: (studentId) => request('GET', '/me/holds', null, studentId),
};
