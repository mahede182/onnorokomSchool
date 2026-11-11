import { useId, useState } from 'react';
import { api } from '../../../api';
import { Alert } from '../../../components/Alert';
import { formatTime } from '../../../utils/formatDate';
import { seatOccupancyPercent } from '../../../utils/seats';

export function ClassCard({ cls, studentId, onHeld }) {
  const alertId = useId();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState('error');
  const pct = seatOccupancyPercent(cls);
  const occupied = cls.heldSeats + cls.confirmedSeats;

  const handleHold = async () => {
    setMsg(null);
    if (!studentId) {
      setMsg('Enter your 17-digit Student ID first (top of page).');
      setMsgType('error');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.createHold(cls.id, studentId);
      setMsg(`Hold created! Expires: ${formatTime(data.expiresAt)}`);
      setMsgType('success');
      onHeld?.();
    } catch (e) {
      setMsg(e.error || 'Failed to create hold.');
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
        <li>{cls.confirmedSeats} confirmed</li>
        <li>{cls.heldSeats} held</li>
        <li>{cls.availableSeats} free</li>
      </ul>
      <Alert id={alertId} msg={msg} type={msgType} />
      <button
        type="button"
        className="btn-primary"
        onClick={handleHold}
        disabled={loading || cls.availableSeats === 0}
        aria-describedby={msg ? alertId : undefined}
      >
        {loading ? 'Holding…' : cls.availableSeats === 0 ? 'Full' : 'Hold a Seat'}
      </button>
    </article>
  );
}
