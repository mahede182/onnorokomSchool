import { STUDENT_ID_LENGTH, STUDENT_ID_PATTERN } from '../constants/student';

/*
Purpose:
Normalize and validate the 17-digit student ID used on student-facing API calls.

Response:
- sanitizeStudentId → digits-only string capped at STUDENT_ID_LENGTH
- isValidStudentId → true when value matches exactly 17 digits

Business Rules:
- Only digits are allowed
- Must be exactly 17 characters after sanitization for API use

Flow:
1. Strip non-digits and truncate
2. Test against STUDENT_ID_PATTERN

Side Effects:
None

Failure Cases:
Invalid IDs return false from isValidStudentId (callers show UI errors)
*/
export function sanitizeStudentId(value) {
  return String(value || '').replace(/\D/g, '').slice(0, STUDENT_ID_LENGTH);
}

export function isValidStudentId(value) {
  return STUDENT_ID_PATTERN.test(String(value || '').trim());
}
