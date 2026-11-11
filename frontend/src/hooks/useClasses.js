import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

const POLL_MS = 5000;

/*
Purpose:
Load class list and refresh seat counts periodically without a full page reload.

Response:
{ classes, loading, error, reload }

Business Rules:
Assignment UI — seat counts update every few seconds.

Flow:
1. Fetch on mount
2. Poll every POLL_MS
3. Surface friendly errors (keep last good data)

Side Effects:
Network polling interval

Failure Cases:
Network/API errors set error message; previous classes retained
*/
export function useClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.getClasses();
      setClasses(data);
      setError(null);
    } catch (e) {
      setError(e.error || e.message || 'Could not load classes. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    const id = setInterval(() => reload({ silent: true }), POLL_MS);
    return () => clearInterval(id);
  }, [reload]);

  return { classes, loading, error, reload };
}
