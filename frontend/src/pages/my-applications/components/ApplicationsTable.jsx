import { useEffect, useState } from 'react';
import { Badge } from '../../../components/Badge';
import { HOLD_STATUS } from '../../../constants/holdStatus';
import { formatCountdown, isExpired } from '../../../utils/countdown';
import { formatDateTime } from '../../../utils/formatDate';

export function ApplicationsTable({ holds, holdDurationSeconds, onConfirm, onCancel }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="visually-hidden">Your seat holds and admissions</caption>
        <thead>
          <tr>
            <th scope="col">Class</th>
            <th scope="col">Status</th>
            <th scope="col">Expires</th>
            <th scope="col">Time left</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {holds.map((h) => {
            const expiredLive =
              h.status === HOLD_STATUS.HELD && isExpired(h.expiresAt, now);
            const status = expiredLive ? HOLD_STATUS.EXPIRED : h.status;
            const canPay = status === HOLD_STATUS.HELD;

            return (
              <tr key={h.holdId}>
                <td>
                  <strong>{h.className}</strong>
                  <div className="hold-id text-sm">{h.holdId}</div>
                </td>
                <td>
                  <Badge status={status} />
                </td>
                <td>
                  <time dateTime={h.expiresAt} className="text-sm">
                    {formatDateTime(h.expiresAt)}
                  </time>
                </td>
                <td>
                  {status === HOLD_STATUS.HELD ? (
                    <span
                      className="countdown"
                      title={`Hold window ${holdDurationSeconds}s from API (HOLD_DURATION_SECONDS)`}
                    >
                      {formatCountdown(h.expiresAt, now, holdDurationSeconds)}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    {canPay && (
                      <>
                        <button
                          type="button"
                          className="btn-success btn-compact"
                          onClick={() => onConfirm(h.holdId)}
                        >
                          Pay Admission Fee
                        </button>
                        <button
                          type="button"
                          className="btn-danger btn-compact"
                          onClick={() => onCancel(h.holdId)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {status === HOLD_STATUS.CONFIRMED && (
                      <span className="text-sm">Admitted</span>
                    )}
                    {(status === HOLD_STATUS.EXPIRED ||
                      status === HOLD_STATUS.CANCELLED) && (
                      <span className="text-muted">—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
