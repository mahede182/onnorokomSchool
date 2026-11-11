import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Alert } from '../../components/Alert';
import { Spinner } from '../../components/Spinner';
import { ROUTES, ROUTE_TITLES } from '../../constants/routes';
import { useStudent } from '../../contexts/StudentContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useHoldDuration } from '../../hooks/useHoldDuration';
import { useMyHolds } from '../../hooks/useMyHolds';
import { formatHoldWindow } from '../../utils/countdown';
import { isValidStudentId } from '../../utils/studentId';
import { ApplicationsTable } from './components/ApplicationsTable';

export function MyApplicationsPage() {
  useDocumentTitle(ROUTE_TITLES[ROUTES.APPLICATIONS]);
  const { studentId } = useStudent();
  const holdDurationSeconds = useHoldDuration();
  const ready = isValidStudentId(studentId);
  const {
    holds,
    loading,
    message,
    messageType,
    setMessage,
    setMessageType,
    reload,
  } = useMyHolds(ready ? studentId : '');

  const handleConfirm = async (holdId) => {
    setMessage(null);
    try {
      await api.confirmHold(holdId, studentId);
      setMessage('Admission fee paid — seat confirmed!');
      setMessageType('success');
      reload({ silent: true });
    } catch (e) {
      setMessage(e.error || 'Could not confirm payment. The hold may have expired.');
      setMessageType('error');
    }
  };

  const handleCancel = async (holdId) => {
    setMessage(null);
    try {
      await api.cancelHold(holdId, studentId);
      setMessage('Application cancelled.');
      setMessageType('success');
      reload({ silent: true });
    } catch (e) {
      setMessage(e.error || 'Could not cancel this application.');
      setMessageType('error');
    }
  };

  return (
    <div className="page section">
      <div className="section-intro">
        <span className="tag">Applications</span>
        <h2>My Applications</h2>
        <p>
          View holds, live countdown, and pay or cancel. Birth registration is
          set on the Admissions page and saved in this browser.
        </p>
      </div>

      {!ready ? (
        <section className="card">
          <Alert
            type="error"
            msg="No birth registration number yet. Enter it on Admissions before applying or viewing applications."
          />
          <Link to={ROUTES.CLASSES} className="btn-primary">
            Go to Admissions
          </Link>
        </section>
      ) : (
        <section className="card" aria-labelledby="applications-heading" aria-busy={loading}>
          <div className="card-header-row">
            <div>
              <h2 id="applications-heading">Your applications</h2>
              <p className="text-muted">
                Viewing as <code>{studentId}</code>. Hold window{' '}
                <strong>{formatHoldWindow(holdDurationSeconds)}</strong>{' '}
                (from API <code>HOLD_DURATION_SECONDS</code>). Status updates
                live; Pay Admission Fee disables when a hold expires.
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => reload()}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
          <Alert msg={message} type={messageType} />
          {loading && holds.length === 0 ? (
            <Spinner label="Loading applications" />
          ) : holds.length === 0 ? (
            <p className="text-muted">No applications yet. Apply from Admissions.</p>
          ) : (
            <ApplicationsTable
              holds={holds}
              holdDurationSeconds={holdDurationSeconds}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          )}
        </section>
      )}
    </div>
  );
}
