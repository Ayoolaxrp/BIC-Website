import { useEffect, useState } from 'react';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import TiltCard from '../components/TiltCard';
import MagneticButton from '../components/MagneticButton';
import useCountdown from '../hooks/useCountdown';
import usePaystack from '../hooks/usePaystack';
import { fetchEvents } from '../lib/api';
import { submitRecord } from '../lib/store';
import { PAYSTACK_PUBLIC_KEY, paystackConfigured } from '../lib/config';

const NEXT_EVENT_DATE = '2026-10-24T10:00:00';

const upcomingEvents = [
  {
    id: 'summit-2026',
    img: '/images/events.png',
    alt: 'Annual Finance Summit',
    title: 'Annual Student Finance Summit 2026',
    desc: 'Join industry leaders and top alumni as we discuss market trends, investment strategies, and career growth in an ever-changing economic landscape.',
    tags: [
      { label: 'Flagship Summit', cls: 'badge-gold' },
      { label: 'Networking', cls: 'badge-navy' },
    ],
    details: [
      { label: 'Date & Time', lines: ['Oct 24, 2026', '10:00 AM - 4:00 PM'] },
      { label: 'Location', lines: ['Main Auditorium', 'Babcock University'] },
      { label: 'Tickets', lines: ['Members: Free', 'Non-Members: ₦2,000'] },
    ],
    speakerSlots: ['Industry keynote speaker (announced)', 'Alumni panel — finance & audit careers', 'Student sector leads roundtable'],
    ticketAmount: 2000,
  },
  {
    id: 'ta-masterclass',
    img: '/images/about.png',
    alt: 'Technical Analysis Masterclass',
    title: 'Technical Analysis Masterclass',
    desc: 'Learn how to read charts, identify patterns, and make data-driven trading decisions. A perfect hands-on session for beginners.',
    tags: [
      { label: 'Workshop', cls: 'badge-green' },
      { label: 'Education', cls: 'badge-navy' },
    ],
    details: [
      { label: 'Date & Time', lines: ['Nov 05, 2026', '2:00 PM - 5:00 PM'] },
      { label: 'Location', lines: ['Virtual', '(Zoom link provided)'] },
    ],
    speakerSlots: ['Facilitated by BIC sector leads'],
    ticketAmount: 0,
  },
  {
    id: 'stock-pitch-2026',
    img: '/images/events.png',
    alt: 'Student Stock Pitch Challenge',
    title: 'Student Stock Pitch Challenge',
    desc: 'Compete in our flagship pitch competition — build an investment thesis, defend it before a panel of industry judges, and win prizes plus CV-worthy recognition.',
    tags: [
      { label: 'Competition', cls: 'badge-gold' },
      { label: 'Prizes', cls: 'badge-green' },
    ],
    details: [
      { label: 'Date & Time', lines: ['Nov 28, 2026', '12:00 PM - 5:00 PM'] },
      { label: 'Location', lines: ['Business School', 'Babcock University'] },
      { label: 'Entry', lines: ['Members: Free', 'Teams of 2–4'] },
    ],
    speakerSlots: ['Judging panel: invited industry professionals (announced)'],
    ticketAmount: 0,
  },
];

const pastEvents = [
  {
    id: 'mixer-2025',
    img: '/images/hero-bg.png',
    title: 'End of Semester Mixer',
    date: 'Nov 18, 2025 · 5:00 PM',
    desc: 'Members connected with peers, shared investment ideas, and built their professional networks over refreshments at the Student Center Lounge.',
    gallery: 6,
  },
  {
    id: 'summit-2025',
    img: '/images/events.png',
    title: 'Annual Student Finance Summit 2025',
    date: 'Oct 24, 2025 · 10:00 AM',
    desc: 'Our flagship summit brought industry leaders and 400+ students together for panels, masterclasses, and a student investing competition.',
    gallery: 6,
  },
  {
    id: 'trading-tournament',
    img: '/images/about.png',
    title: 'Mock Trading Tournament',
    date: 'Feb 14, 2026 · 12:00 PM',
    desc: 'Students competed in a simulated market environment, managing virtual portfolios under live market conditions.',
    gallery: 4,
  },
];

const CheckIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
);

export default function Events() {
  const [tab, setTab] = useState('upcoming');
  const [dbEvents, setDbEvents] = useState([]);
  const [countdownTarget, setCountdownTarget] = useState(NEXT_EVENT_DATE);
  const parts = useCountdown(countdownTarget);
  const { pay } = usePaystack();

  // Live events from Supabase when configured; otherwise the curated seed list.
  useEffect(() => {
    let alive = true;
    fetchEvents().then((rows) => {
      if (!alive || !rows.length) return;
      setDbEvents(rows);
      // Point the hero countdown at the earliest real upcoming event
      const next = rows.find((e) => e.is_upcoming !== false && e.event_date);
      if (next?.event_date) setCountdownTarget(`${next.event_date}T09:00:00`);
    });
    return () => {
      alive = false;
    };
  }, []);

  const liveUpcoming = dbEvents
    .filter((e) => e.is_upcoming !== false)
    .map((e) => ({
      id: e.id,
      img: e.image_url || '/images/events.png',
      alt: e.title,
      title: e.title,
      desc: e.description || '',
      tags: [{ label: e.event_type || 'Event', cls: 'badge-gold' }],
      details: [
        { label: 'Date & Time', lines: [e.event_date || 'TBA', e.event_time || ''] },
        { label: 'Location', lines: [e.location || 'Babcock University'] },
      ],
      speakerSlots: ['Speakers announced on our socials'],
      ticketAmount: 0,
    }));

  const upcoming = liveUpcoming.length ? liveUpcoming : upcomingEvents;

  // RSVP form state
  const [rsvp, setRsvp] = useState({ name: '', email: '', event: upcomingEvents[0]?.id || 'summit-2026' });
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpStored, setRsvpStored] = useState(null); // { source: 'supabase' | 'local' }

  const buyTicket = (event) => {
    if (!window.PaystackPop) {
      alert('Payment gateway is still loading. Please wait a moment and try again.');
      return;
    }
    // Prefer the RSVP email if the attendee already provided one
    let email = rsvp.email && rsvp.email.trim();
    if (!email) email = window.prompt('Enter your email address to receive your ticket:');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return;

    const opened = pay({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: event.ticketAmount,
      // Lets the paystack-webhook record this ticket purchase server-side
      metadata: {
        payment_type: 'ticket',
        event_id: event.id,
        event_name: event.title,
      },
      onSuccess: (response) => alert(`Payment complete! Reference: ${response.reference}`),
      onClose: () => alert('Transaction window closed.'),
    });
    if (!opened) alert('Payment gateway is still loading. Please wait a moment and try again.');
  };

  const handleRsvp = async (e) => {
    e.preventDefault();
    const event = upcoming.find((ev) => ev.id === rsvp.event);
    const res = await submitRecord('rsvps', {
      name: rsvp.name,
      email: rsvp.email,
      event_name: event?.title || rsvp.event,
    });
    setRsvpStored(res);
    setRsvpDone(true);
  };

  return (
    <>
      <PageHero
        crumb="Events"
        title="Upcoming Events & Summits"
        description="Don't miss our upcoming flagship event. Register early to secure your seat."
      >
        <div style={{ marginTop: 16 }}>
          <span style={{ color: 'var(--sky-blue)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Next Major Event Starts In:
          </span>
        </div>
        <div className="hero-countdown">
          {parts ? (
            <>
              {[
                [parts.days, 'Days'],
                [parts.hours, 'Hrs'],
                [parts.minutes, 'Min'],
                [parts.seconds, 'Sec'],
              ].map(([num, label]) => (
                <div className="cd-unit" key={label}>
                  <span className="cd-num">{String(num).padStart(2, '0')}</span>
                  <span className="cd-label">{label}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="cd-unit"><span className="cd-num">Now</span><span className="cd-label">Live!</span></div>
          )}
        </div>
      </PageHero>

      {/* TABS */}
      <section className="section container fade-in visible">
        <div className="tabs">
          <button type="button" className={`tab-btn${tab === 'upcoming' ? ' active' : ''}`} onClick={() => setTab('upcoming')}>
            Upcoming Events
          </button>
          <button type="button" className={`tab-btn${tab === 'past' ? ' active' : ''}`} onClick={() => setTab('past')}>
            Past Events
          </button>
        </div>

        {/* UPCOMING PANEL */}
        <div className={`tab-panel${tab === 'upcoming' ? ' active' : ''}`}>
          <div className="events-list">
            {upcoming.map((event) => (
              <TiltCard className="event-row" key={event.id} max={4} glare={false}>
                <div className="event-row-img">
                  <img src={event.img} alt={event.alt} />
                </div>
                <div className="event-row-content">
                  <div className="event-tags">
                    {event.tags.map((t) => (
                      <span className={`badge ${t.cls}`} key={t.label}>{t.label}</span>
                    ))}
                  </div>
                  <h3>{event.title}</h3>
                  <p style={{ marginBottom: 24 }}>{event.desc}</p>

                  <div className="event-details">
                    {event.details.map((d) => (
                      <div className="event-detail-item" key={d.label}>
                        <div className="event-detail-icon"><CheckIcon /></div>
                        <div className="event-detail-text">
                          <h5>{d.label}</h5>
                          <p style={{ whiteSpace: 'pre-line' }}>{d.lines.join('\n')}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="speaker-list">
                    {(event.speakerSlots || []).map((s) => (
                      <div className="speaker-chip" key={s}>
                        <span>🎤 {s}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {event.ticketAmount > 0 && paystackConfigured ? (
                      <MagneticButton><button type="button" className="btn btn-primary" onClick={() => buyTicket(event)}>
                        Buy Ticket / RSVP (₦{event.ticketAmount.toLocaleString()})
                      </button></MagneticButton>
                    ) : event.ticketAmount > 0 ? (
                      <button type="button" className="btn btn-primary" disabled title="Payments are enabled once the Paystack key is configured.">
                        Tickets available after setup
                      </button>
                    ) : (
                      <MagneticButton><button type="button" className="btn btn-navy" style={{ alignSelf: 'flex-start' }} onClick={() => alert('RSVP confirmed. A Zoom link will be shared with members.')}>
                        RSVP (Members Only)
                      </button></MagneticButton>
                    )}
                    <button type="button" className="btn btn-outline" onClick={() => document.getElementById('rsvp-box')?.scrollIntoView({ behavior: 'smooth' })}>
                      Reserve a Spot
                    </button>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* PAST PANEL */}
        <div className={`tab-panel${tab === 'past' ? ' active' : ''}`}>
          <div className="events-list">
            {pastEvents.map((event) => (
              <div className="event-row" key={event.id}>
                <div className="event-row-img">
                  <img src={event.img} alt={event.title} />
                </div>
                <div className="event-row-content">
                  <div className="event-tags">
                    <span className="badge badge-navy" style={{ opacity: 0.6 }}>Past Event</span>
                  </div>
                  <h3>{event.title}</h3>
                  <p style={{ marginBottom: 16 }}>{event.desc}</p>
                  <p style={{ color: 'var(--gray-500)', fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>
                    📅 {event.date}
                  </p>
                  <div className="gallery-grid">
                    {Array.from({ length: event.gallery }).map((_, i) => (
                      <TiltCard className="gallery-item" key={i} max={10} glare={false}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </TiltCard>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RSVP FORM */}
      <FadeIn className="section bg-off-white">
        <div className="container" id="rsvp-box">
          <div className="rsvp-box">
            <div className="text-center" style={{ marginBottom: 32 }}>
              <span className="section-label">Event Registration</span>
              <h2 className="section-title">
                Reserve Your <span>Spot</span>
              </h2>
              <div className="gold-line"></div>
            </div>

            {rsvpDone ? (
              <div className="form-status visible success" style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
                🎉 You're on the list! We'll send your registration details to {rsvp.email}.
                {rsvpStored?.source === 'local' && ' (Saved on this device — connect Supabase to store it in the cloud.)'}
              </div>
            ) : (
              <form onSubmit={handleRsvp} style={{ maxWidth: 420, margin: '0 auto' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={rsvp.name}
                    onChange={(e) => setRsvp({ ...rsvp, name: e.target.value })}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={rsvp.email}
                    onChange={(e) => setRsvp({ ...rsvp, email: e.target.value })}
                    placeholder="jane.doe@babcock.edu.ng"
                  />
                </div>
                <div className="form-group">
                  <label>Select Event</label>
                  <select value={rsvp.event} onChange={(e) => setRsvp({ ...rsvp, event: e.target.value })}>
                    {upcoming.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14, justifyContent: 'center' }}>
                  Submit RSVP
                </button>
              </form>
            )}
          </div>
        </div>
      </FadeIn>
    </>
  );
}
