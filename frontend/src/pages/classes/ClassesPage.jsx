import { Alert } from '../../components/Alert';
import { Spinner } from '../../components/Spinner';
import { ROUTES, ROUTE_TITLES } from '../../constants/routes';
import { useStudent } from '../../contexts/StudentContext';
import { useClasses } from '../../hooks/useClasses';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ClassCard } from './components/ClassCard';
import { CreateClassForm } from './components/CreateClassForm';

export function ClassesPage() {
  useDocumentTitle(ROUTE_TITLES[ROUTES.CLASSES]);
  const { studentId } = useStudent();
  const { classes, loading, error, reload } = useClasses();

  return (
    <div className="page">
      <h2 className="visually-hidden">Classes</h2>
      <CreateClassForm onCreated={reload} />

      <section aria-labelledby="available-classes-heading">
        <div className="card-header-row" style={{ marginBottom: '0.75rem' }}>
          <h2 id="available-classes-heading">Available Classes</h2>
          <p className="text-muted">Seat counts refresh every few seconds.</p>
        </div>
        {error && <Alert msg={error} type="error" />}
        {loading && classes.length === 0 ? (
          <Spinner label="Loading classes" />
        ) : classes.length === 0 ? (
          <p className="text-muted">No classes yet. Create one above.</p>
        ) : (
          <div className="class-grid">
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                studentId={studentId}
                onHeld={() => reload({ silent: true })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
