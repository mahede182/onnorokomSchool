import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api';
import { Alert } from '../../../components/Alert';
import { ROUTES } from '../../../constants/routes';
import { formatTime } from '../../../utils/formatDate';
import { seatOccupancyPercent } from '../../../utils/seats';

export function ClassCard({ cls, studentId, canApply, onHeld }) {
  const alertId = useId();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState('error');
  const pct = seatOccupancyPercent(cls);
  const occupied = cls.heldSeats + cls.confirmedSeats;

  const handleHold = async () => {
    setMsg(null);
    if (!canApply) {
      setMsg('Enter a valid 17-digit birth registration number above before applying.');
      setMsgType('error');
      document.getElementById('student-id')?.focus();
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.createHold(cls.id, studentId);
      setMsg(`Applied! Hold expires at ${formatTime(data.expiresAt)}.`);
      setMsgType('success');
      onHeld?.();
    } catch (e) {
      setMsg(e.error || 'Could not apply. Seats may be full or the hold window expired.');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="class-card" aria-labelledby={`class-title-${cls.id}`}>
      <h3 id={`class-title-${cls.id}`}>{cls.name}</h3>
      <div
        className="seat-bar mt-1"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={cls.totalSeats}
        aria-valuenow={occupied}
        aria-label={`${occupied} of ${cls.totalSeats} seats occupied`}
      >
        <div className="seat-bar-inner" style={{ width: `${pct}%` }} />
      </div>
      <ul className="seat-stats">
        <li>Total {cls.totalSeats}</li>
        <li>Held {cls.heldSeats}</li>
        <li>Confirmed {cls.confirmedSeats}</li>
        <li>Vacant {cls.availableSeats}</li>
      </ul>
      <Alert id={alertId} msg={msg} type={msgType} />
      <div className="row" style={{ gap: '0.5rem' }}>
        <button
          type="button"
          className="btn-primary"
          onClick={handleHold}
          disabled={loading || !canApply || cls.availableSeats === 0}
          aria-describedby={msg ? alertId : undefined}
        >
          {loading
            ? 'Applying…'
            : cls.availableSeats === 0
              ? 'Full'
              : !canApply
                ? 'Enter ID to apply'
                : 'Apply Now'}
        </button>
        {msgType === 'success' && (
          <Link to={ROUTES.APPLICATIONS} className="btn-secondary btn-compact">
            View application
          </Link>
        )}
      </div>
    </article>
  );
}
