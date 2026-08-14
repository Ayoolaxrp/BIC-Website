/**
 * Returns the initials badge text for a person's full name,
 * e.g. "Okara Nissi Bisindor" -> "OB". Falls back to the first letter.
 */
export function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] || '';
  const last = parts[parts.length - 1]?.[0] || '';
  return (first + last).toUpperCase();
}
