import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../auth';

const TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

export function useInactivityLogout() {
  const navigate = useNavigate();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        await authClient.signOut();
        navigate('/login', { replace: true });
      }, TIMEOUT_MS);
    }

    reset();
    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }));

    return () => {
      if (timer.current) clearTimeout(timer.current);
      EVENTS.forEach(e => window.removeEventListener(e, reset));
    };
  }, [navigate]);
}
