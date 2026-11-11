import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STUDENT_ID_STORAGE_KEY } from '../constants/storage';
import { sanitizeStudentId } from '../utils/studentId';

const StudentContext = createContext(null);

function readStoredStudentId() {
  try {
    return sanitizeStudentId(localStorage.getItem(STUDENT_ID_STORAGE_KEY) || '');
  } catch {
    return '';
  }
}

export function StudentProvider({ children }) {
  const [studentId, setStudentIdRaw] = useState(readStoredStudentId);

  useEffect(() => {
    try {
      if (studentId) localStorage.setItem(STUDENT_ID_STORAGE_KEY, studentId);
      else localStorage.removeItem(STUDENT_ID_STORAGE_KEY);
    } catch {
      /* ignore quota / private mode */
    }
  }, [studentId]);

  const value = useMemo(
    () => ({
      studentId,
      setStudentId: (next) => setStudentIdRaw(sanitizeStudentId(next)),
    }),
    [studentId],
  );

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) {
    throw new Error('useStudent must be used within StudentProvider');
  }
  return ctx;
}
