import { STUDENT_ID_LENGTH } from '../constants/student';
import { useStudent } from '../contexts/StudentContext';
import { generateBirthRegistration } from '../utils/generateBirthRegistration';
import { isValidStudentId } from '../utils/studentId';

export function StudentIdInput({ showGenerate = true, status = null }) {
  const { studentId, setStudentId } = useStudent();
  const hintId = 'student-id-hint';
  const invalid = studentId.length > 0 && !isValidStudentId(studentId);

  return (
    <div className="student-id-field">
      <label htmlFor="student-id">
        Birth registration no. ({STUDENT_ID_LENGTH} digits)
      </label>
      <div className="student-id-row">
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
        {showGenerate && (
          <button
            type="button"
            className="btn-secondary btn-compact"
            onClick={() => setStudentId(generateBirthRegistration())}
          >
            Dev Generate
          </button>
        )}
      </div>
      <p id={hintId} className="text-muted student-id-hint">
        Required to apply, pay admission fee, or cancel. Saved in this browser.
      </p>
      {status}
    </div>
  );
}
