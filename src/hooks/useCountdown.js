import { useEffect, useState } from 'react';

function getParts(target) {
  const diff = target - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

/**
 * Live countdown for an ISO date string (e.g. "2026-10-24T10:00:00").
 * Returns null once the target has passed. React port of the
 * static countdown timer (setInterval -> state).
 */
export default function useCountdown(dateString) {
  const [parts, setParts] = useState(() => getParts(new Date(dateString).getTime()));

  useEffect(() => {
    const id = setInterval(() => {
      setParts(getParts(new Date(dateString).getTime()));
    }, 1000);
    return () => clearInterval(id);
  }, [dateString]);

  return parts;
}
