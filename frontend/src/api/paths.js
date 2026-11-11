/**
 * Assignment §1.4 API surface — keep paths exact (automated tests hit these).
 * Each shift is modeled as its own class on these endpoints.
 */
export const API_PATHS = {
  config: '/config',
  classes: '/classes',
  classById: (classId) => `/classes/${encodeURIComponent(classId)}`,
  classHolds: (classId) => `/classes/${encodeURIComponent(classId)}/holds`,
  holdById: (holdId) => `/holds/${encodeURIComponent(holdId)}`,
  confirmHold: (holdId) => `/holds/${encodeURIComponent(holdId)}/confirm`,
  myHolds: '/me/holds',
};

export const STUDENT_ID_HEADER = 'X-Student-Id';
