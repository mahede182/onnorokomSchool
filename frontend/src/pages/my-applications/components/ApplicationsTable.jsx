import { useEffect, useState } from 'react';
import { Badge } from '../../../components/Badge';
import { HOLD_STATUS } from '../../../constants/holdStatus';
import { formatCountdown, isExpired } from '../../../utils/countdown';
import { formatDateTime } from '../../../utils/formatDate';

export function ApplicationsTable({ holds, onConfirm, onCancel }) {
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
            <th scope="col">Hold ID</th>
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
                <td>{h.className}</td>
                <td>
                  <code className="hold-id">{h.holdId}</code>
                </td>
                <td>
                  <Badge status={status} />
                </td>
                <td>
                  <time dateTime={h.expiresAt} className="text-sm">
                    {formatDateTime(h.expiresAt)}
                  </time>
                </td>
                <td className="text-sm">
                  {status === HOLD_STATUS.HELD
                    ? formatCountdown(h.expiresAt, now)
                    : '—'}
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
