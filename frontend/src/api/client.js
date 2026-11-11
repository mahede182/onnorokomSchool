import { API_BASE_URL } from '../config/env';
import { STUDENT_ID_HEADER } from './paths';
import { isValidStudentId } from '../utils/studentId';

/*
Purpose:
JSON fetch wrapper for the §1.4 Admission API.

Response:
{ status, data } on success; throws { status, error, data } on failure.

Business Rules:
- Base URL defaults to http://localhost:8080
- All bodies/responses are JSON
- Student endpoints send X-Student-Id (17-digit birth registration)
- Do not rename/drop contract response fields in callers

Flow:
1. Optionally require a valid student ID
2. Build headers (Accept always; Content-Type when body)
3. fetch under API_BASE_URL
4. Parse JSON and surface friendly errors

Side Effects:
Network request

Failure Cases:
Missing student ID, network down, non-OK HTTP → throw { error }
*/
export async function request(method, path, { body, studentId, requireStudentId } = {}) {
  if (requireStudentId && !isValidStudentId(studentId)) {
    throw {
      status: 400,
      error: 'A valid 17-digit birth registration number (X-Student-Id) is required.',
      data: null,
    };
  }

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (studentId) headers[STUDENT_ID_HEADER] = studentId;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw {
      status: 0,
      error: 'Cannot reach the server. Is the API running at ' + API_BASE_URL + '?',
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
