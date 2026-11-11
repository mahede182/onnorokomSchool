import { STUDENT_ID_LENGTH } from '../constants/student';

export function generateBirthRegistration() {
  let out = '';
  for (let i = 0; i < STUDENT_ID_LENGTH; i += 1) {
    out += Math.floor(Math.random() * 10).toString();
  }
  return out;
}
