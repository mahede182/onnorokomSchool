import { useMemo, useState } from 'react';
import { Alert } from '../../components/Alert';
import { HeroBanner } from '../../components/HeroBanner';
import { ProcessSteps } from '../../components/ProcessSteps';
import { Spinner } from '../../components/Spinner';
import { StudentIdInput } from '../../components/StudentIdInput';
import { ROUTES, ROUTE_TITLES } from '../../constants/routes';
import { SHIFTS, matchesShift } from '../../constants/shifts';
import { useStudent } from '../../contexts/StudentContext';
import { useClasses } from '../../hooks/useClasses';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { isValidStudentId } from '../../utils/studentId';
import { ClassCard } from './components/ClassCard';

export function ClassesPage() {
  useDocumentTitle(ROUTE_TITLES[ROUTES.CLASSES]);
  const { studentId } = useStudent();
  const { classes, loading, error, reload } = useClasses();
  const [shiftFilter, setShiftFilter] = useState('');
  const canApply = isValidStudentId(studentId);

  const filtered = useMemo(
    () => classes.filter((c) => matchesShift(c.name, shiftFilter)),
    [classes, shiftFilter],
  );

  const applyStatus = (
    <p className="text-muted classes-panel__status">
      {canApply
        ? <>Ready to apply as <code>{studentId}</code></>
        : 'Enter birth registration to unlock Apply Now.'}
    </p>
  );

  return (
    <div className="page">
      <HeroBanner />

      <section className="section" aria-labelledby="available-classes-heading">
        <div className="section-intro">
          <span className="tag">Classes</span>
          <h2 id="available-classes-heading">Available Classes</h2>
          <p>
            Set your birth registration, pick a shift, then apply. Seat counts
            refresh every few seconds without reloading.
          </p>
        </div>

        <div className="card classes-panel__shift-card">
          <label htmlFor="shift-filter">Shift</label>
          <select
            id="shift-filter"
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
          >
            <option value="">All shifts</option>
            {SHIFTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="card classes-panel">
          <div className="classes-panel__identity">
            <StudentIdInput showGenerate status={applyStatus} />
          </div>

          {!canApply && (
            <Alert
              type="error"
              msg="Enter or generate a 17-digit birth registration number before applying."
            />
          )}
          {error && <Alert msg={error} type="error" />}

          <div className="classes-panel__list">
            {loading && classes.length === 0 ? (
              <Spinner label="Loading classes" />
            ) : filtered.length === 0 ? (
              <p className="text-muted classes-panel__empty">
                No classes for this filter. Admins can create classes on the Admin page.
              </p>
            ) : (
              <div className="class-grid">
                {filtered.map((cls) => (
                  <ClassCard
                    key={cls.id}
                    cls={cls}
                    studentId={studentId}
                    canApply={canApply}
                    onHeld={() => reload({ silent: true })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <ProcessSteps />
    </div>
  );
}
