import { useEffect, useState } from 'react';
import { api } from '../api';

const DEFAULT_SECONDS = 600;

/*
Purpose:
Load HOLD_DURATION_SECONDS from the API so the UI matches .env without Vite duplication.

Response:
Positive integer seconds (defaults to 600 until loaded / on failure).

Business Rules:
- Backend is the single source of truth
- Invalid payloads fall back to 600

Flow:
1. Fetch GET /config once on mount
2. Read holdDurationSeconds
3. Keep previous/default on error

Side Effects:
One network request

Failure Cases:
Network/parse errors → keep DEFAULT_SECONDS
*/
export function useHoldDuration() {
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.getConfig();
        const value = Number(data?.holdDurationSeconds);
        if (!cancelled && Number.isFinite(value) && value > 0) {
          setSeconds(Math.floor(value));
        }
      } catch {
        // Keep default — timer still ends at expiresAt from each hold.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return seconds;
}
