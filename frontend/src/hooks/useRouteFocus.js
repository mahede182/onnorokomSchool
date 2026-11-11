import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/*
Purpose:
Restore browser-like focus after SPA route changes for keyboard/AT users.

Response:
Returns a ref to attach to the main landmark (tabIndex={-1}).

Business Rules:
Focus main content when pathname changes so assistive tech announces the new view.

Flow:
1. Track location.pathname
2. Focus mainRef after navigation

Side Effects:
Moves DOM focus

Failure Cases:
No-op if ref is unset
*/
export function useRouteFocus() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    mainRef.current?.focus();
  }, [pathname]);

  return mainRef;
}
