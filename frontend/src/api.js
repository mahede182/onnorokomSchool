const BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(method, path, body, studentId) {
  const headers = { 'Content-Type': 'application/json' };
  if (studentId) headers['X-Student-Id'] = studentId;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw { status: res.status, error: data?.error || data?.title || 'Unknown error', data };
  }

  return { status: res.status, data };
}

export const api = {
  getClasses: () => request('GET', '/classes'),
  getClass: (id) => request('GET', `/classes/${id}`),
  createClass: (name, totalSeats) => request('POST', '/classes', { name, totalSeats }),
  createHold: (classId, studentId) => request('POST', `/classes/${classId}/holds`, null, studentId),
  getHold: (holdId) => request('GET', `/holds/${holdId}`),
  confirmHold: (holdId, studentId) => request('POST', `/holds/${holdId}/confirm`, null, studentId),
  cancelHold: (holdId, studentId) => request('DELETE', `/holds/${holdId}`, null, studentId),
  getMyHolds: (studentId) => request('GET', '/me/holds', null, studentId),
};
