import { useState } from 'react';
import { checkMember } from '../lib/api';
import { sectorLabel } from '../lib/sectors';

// +234 813 825 7616, from however the student typed it
const pretty = (raw) => {
  const d = String(raw || '').replace(/\D/g, '');
  return d.length >= 10 ? `+234 ${d.slice(-10, -7)} ${d.slice(-7, -4)} ${d.slice(-4)}` : String(raw || '');
};

/** For club-wide executives: is this person registered, and have they paid? */
export default function MemberCheck() {
  const [query, setQuery] = useState('');
  const [asked, setAsked] = useState('');
  const [state, setState] = useState({ status: 'idle', rows: [], error: '' }); // idle | short | loading | done | error

  const search = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 3) {
      setState({ status: 'short', rows: [], error: '' });
      return;
    }
    setAsked(q);
    setState({ status: 'loading', rows: [], error: '' });
    const res = await checkMember(q);
    setState(res.ok ? { status: 'done', rows: res.rows, error: '' } : { status: 'error', rows: [], error: res.error });
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel-title">Member check</h2>
      <p className="admin-subtitle">
        Paste the number from a WhatsApp join request, or type a name or email. Accept only people marked Paid. Anyone who paid can join any group.
      </p>
      <form className="member-check-form" onSubmit={search}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Number, name or email"
          aria-label="Number, name or email"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className="btn btn-primary" disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'Checking…' : 'Check'}
        </button>
      </form>

      <div role="status" aria-live="polite">
        {state.status === 'short' && <p className="admin-empty">Type at least 3 letters, or 7 digits of a number.</p>}
        {state.status === 'error' && <p className="admin-empty" role="alert">{state.error}</p>}
        {state.status === 'done' && state.rows.length === 0 && (
          <p className="admin-empty">
            No registered member found for “{asked}”. Decline the request, or ask them for the name and email they registered with and search again.
          </p>
        )}
        {state.status === 'done' && state.rows.length > 0 && (
          <div className="admin-sub-list">
            {state.rows.map((r, i) => (
              <div className="admin-sub-item" key={`${r.phone_number}-${i}`}>
                <div className="admin-sub-head">
                  <strong>{r.full_name}</strong>
                  <span className={r.paid ? 'badge badge-blue' : 'badge'}>{r.paid ? 'Paid' : 'Not paid'}</span>
                </div>
                <p className="member-check-line">
                  {pretty(r.phone_number)}, chose {sectorLabel(r.sector)}
                  {r.paid && r.paid_at ? `, paid ${new Date(r.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
