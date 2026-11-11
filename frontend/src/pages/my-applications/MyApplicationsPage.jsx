import { api } from '../../api';
import { Alert } from '../../components/Alert';
import { Spinner } from '../../components/Spinner';
import { ROUTES, ROUTE_TITLES } from '../../constants/routes';
import { useStudent } from '../../contexts/StudentContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useMyHolds } from '../../hooks/useMyHolds';
import { ApplicationsTable } from './components/ApplicationsTable';

export function MyApplicationsPage() {
  useDocumentTitle(ROUTE_TITLES[ROUTES.APPLICATIONS]);
  const { studentId } = useStudent();
  const {
    holds,
    loading,
    message,
    messageType,
    setMessage,
    setMessageType,
    reload,
  } = useMyHolds(studentId);

  const handleConfirm = async (holdId) => {
    setMessage(null);
    try {
      await api.confirmHold(holdId, studentId);
      setMessage('Admission fee paid — seat confirmed!');
      setMessageType('success');
      reload({ silent: true });
    } catch (e) {
      setMessage(e.error || 'Could not confirm payment.');
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
      setMessage(e.error || 'Could not cancel.');
      setMessageType('error');
    }
  };

  if (!studentId) {
    return (
      <div className="page">
        <h2>My Applications</h2>
        <p className="text-muted">
          Enter your 17-digit Student ID at the top to view applications.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="card" aria-labelledby="applications-heading" aria-busy={loading}>
        <div className="card-header-row">
          <h2 id="applications-heading">My Applications</h2>
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
          <p className="text-muted">No applications found.</p>
        ) : (
          <ApplicationsTable
            holds={holds}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </section>
    </div>
  );
}
