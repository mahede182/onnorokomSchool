import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { HOLD_STATUS } from '../constants/holdStatus';

const POLL_MS = 3000;

function withLiveStatus(holds) {
  const now = Date.now();
  return (holds || []).map((h) => {
    if (h.status === HOLD_STATUS.HELD && new Date(h.expiresAt).getTime() <= now) {
      return { ...h, status: HOLD_STATUS.EXPIRED };
    }
    return h;
  });
}

/*
Purpose:
Load the current student's holds; poll and locally expire HELD rows when time is up.

Response:
{ holds, loading, message, messageType, setMessage, setMessageType, reload, error }

Business Rules:
UI must show EXPIRED without reload once hold time elapses.

Flow:
1. Guard on studentId
2. Fetch /me/holds
3. Poll + recompute live expiry every second tick via poll

Side Effects:
Network polling

Failure Cases:
API/network errors set friendly message/error
*/
export function useMyHolds(studentId) {
  const [holds, setHolds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('error');

  const reload = useCallback(async ({ silent = false } = {}) => {
    if (!studentId) return;
    if (!silent) setLoading(true);
    if (!silent) setMessage(null);
    try {
      const { data } = await api.getMyHolds(studentId);
      setHolds(withLiveStatus(data));
      setError(null);
    } catch (e) {
      const text = e.error || e.message || 'Failed to load applications.';
      setError(text);
      if (!silent) {
        setMessage(text);
        setMessageType('error');
      }
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (!studentId) {
      setHolds([]);
      return undefined;
    }
    reload();
    const poll = setInterval(() => reload({ silent: true }), POLL_MS);
    const tick = setInterval(() => {
      setHolds((prev) => withLiveStatus(prev));
    }, 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [studentId, reload]);

  return {
    holds,
    loading,
    error,
    message,
    messageType,
    setMessage,
    setMessageType,
    reload,
  };
}
