import { useEffect } from 'react';

/**
 * Accessibility helper: auto-associates every visible <label> with the form
 * control that follows it inside the same .form-group container.
 *
 * Forms across the site were written as:
 *   <div className="form-group"><label>Name</label><input ... /></div>
 * which renders a visible label that is NOT programmatically associated —
 * a critical a11y violation (axe: `label`, `select-name`).
 *
 * This effect generates matching id/htmlFor pairs after mount and re-runs
 * whenever the route changes, covering every form without touching 33 JSX
 * call sites. Idempotent: labels already carrying htmlFor are skipped.
 *
 * @param {Array<string>} deps extra deps that trigger re-scan (e.g. route path)
 */
export default function useLabelAssociation(deps = []) {
  useEffect(() => {
    const scan = () => {
      document.querySelectorAll('.form-group, .footer-newsletter, .checkbox-group').forEach((group) => {
        const label = group.querySelector('label');
        const control = group.querySelector('input:not([type=checkbox]), select, textarea');
        if (label && control && !label.htmlFor && !control.id) {
          const id = `f-${Math.random().toString(36).slice(2, 9)}`;
          control.id = id;
          label.htmlFor = id;
        }
      });
      // Checkbox groups: label wraps input — implicit association already
      // exists, but some custom labels sit beside the input.
      document.querySelectorAll('.checkbox-group label input[type=checkbox]').forEach((cb) => {
        if (!cb.id) cb.id = `f-${Math.random().toString(36).slice(2, 9)}`;
      });
    };
    scan();
    // Re-scan shortly after async content settles (route transitions, tab panels)
    const t = setTimeout(scan, 400);
    const t2 = setTimeout(scan, 1200);
    const obs = new MutationObserver(() => scan());
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      obs.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
