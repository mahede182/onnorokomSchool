import { STUDENT_ID_LENGTH } from '../constants/student';
import { useStudent } from '../contexts/StudentContext';
import { isValidStudentId } from '../utils/studentId';

export function StudentIdInput() {
  const { studentId, setStudentId } = useStudent();
  const hintId = 'student-id-hint';
  const invalid = studentId.length > 0 && !isValidStudentId(studentId);

  return (
    <div className="student-id-field">
      <label htmlFor="student-id">
        Your Student ID ({STUDENT_ID_LENGTH} digits)
      </label>
      <input
        id="student-id"
        name="studentId"
        inputMode="numeric"
        autoComplete="username"
        maxLength={STUDENT_ID_LENGTH}
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        placeholder="12345678901234567"
        aria-describedby={hintId}
        aria-invalid={invalid || undefined}
      />
      <p id={hintId} className="text-muted student-id-hint">
        Required for hold, confirm, and cancel actions.
      </p>
    </div>
  );
}
