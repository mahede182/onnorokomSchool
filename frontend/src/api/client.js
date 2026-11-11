import { API_BASE_URL } from '../config/env';

/*
Purpose:
Shared fetch wrapper for the Admission API (base URL + optional X-Student-Id).

Response:
{ status, data } on success; throws { status, error, data } on HTTP failure.

Business Rules:
- JSON body when provided
- Attach X-Student-Id only when studentId is passed
- Never leave UI with blank/console-only failures

Flow:
1. Build headers
2. fetch path under API_BASE_URL
3. Parse JSON (or null)
4. Throw structured friendly error when !res.ok / network fail

Side Effects:
Network request

Failure Cases:
Network errors and non-OK responses throw { error }
*/
export async function request(method, path, body, studentId) {
  const headers = { 'Content-Type': 'application/json' };
  if (studentId) headers['X-Student-Id'] = studentId;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw {
      status: 0,
      error: 'Cannot reach the server. Check that the API is running.',
      data: null,
    };
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw {
      status: res.status,
      error: data?.error || data?.title || `Request failed (${res.status})`,
      data,
    };
  }

  return { status: res.status, data };
}
