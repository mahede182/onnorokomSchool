import { Alert } from '../../components/Alert';
import { Spinner } from '../../components/Spinner';
import { ROUTES, ROUTE_TITLES } from '../../constants/routes';
import { useClasses } from '../../hooks/useClasses';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { CreateClassForm } from '../classes/components/CreateClassForm';

export function AdminPage() {
  useDocumentTitle(ROUTE_TITLES[ROUTES.ADMIN]);
  const { classes, loading, error, reload } = useClasses();

  return (
    <div className="page section">
      <div className="section-intro">
        <span className="tag">Admin</span>
        <h2>Class management</h2>
        <p>
          Create classes with a Morning or Night shift. Each shift is stored as
          its own class with its own seat count.
        </p>
      </div>

      <CreateClassForm onCreated={reload} />

      <section className="card" aria-labelledby="admin-classes-heading">
        <div className="card-header-row">
          <h2 id="admin-classes-heading">Existing classes</h2>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => reload()}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        {error && <Alert msg={error} type="error" />}
        {loading && classes.length === 0 ? (
          <Spinner label="Loading classes" />
        ) : classes.length === 0 ? (
          <p className="text-muted">No classes yet.</p>
        ) : (
          <ul className="admin-class-list">
            {classes.map((cls) => (
              <li key={cls.id}>
                <strong>{cls.name}</strong>
                <span className="text-muted">
                  {' '}
                  · total {cls.totalSeats} · vacant {cls.availableSeats}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
