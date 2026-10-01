import { useEffect, useState } from 'react';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import TiltCard from '../components/TiltCard';
import MagneticButton from '../components/MagneticButton';
import useCountdown from '../hooks/useCountdown';
import AddToCalendar from '../components/AddToCalendar';
import usePaystack from '../hooks/usePaystack';
import { fetchEvents } from '../lib/api';
import { submitRecord } from '../lib/store';
import { PAYSTACK_PUBLIC_KEY, paystackConfigured } from '../lib/config';
import { asset } from '../lib/assets';

// 2026/2027 session calendar — sourced from the official BIC calendar and event posters.
const NEXT_EVENT_DATE = '2026-11-01T10:00:00';

const upcomingEvents = [
  {
    id: 'welcome-2026',
    img: asset('/images/bic-exec-group-2026.webp'),
    alt: 'BIC executives and members gathered for a seminar',
    title: 'BIC Welcome Seminar: The Next Chapter',
    desc: "We launch the 2026/2027 session — introducing the club's new direction, this semester's programs, committees, investment opportunities, and our CFA Society Nigeria relationship. Come see what BIC has planned and how to join.",
    tags: [
      { label: 'Seminar', cls: 'badge-gold' },
      { label: 'Recruitment', cls: 'badge-navy' },
    ],
    details: [
      { label: 'Date & Time', lines: ['Nov 1, 2026', '10:00 AM'] },
      { label: 'Location', lines: ['Babcock University', 'Venue announced on our socials'] },
      { label: 'Entry', lines: ['Free for all students'] },
    ],
    speakerSlots: ['President Okara Nissi Bisindor', 'Executive board introductions', 'Committee & sector showcases'],
    ticketAmount: 0,
  },
  {
    id: 'educational-seminar-1',
    img: asset('/images/bic-photo-1482.webp'),
    alt: 'A BIC educational seminar in session',
    title: 'First BIC Educational Seminar',
    desc: 'The first deep-dive seminar of the semester, led by our sector chairpersons — practical finance education across Securities, Real Estate, Crypto, Forex, and Personal Finance.',
    tags: [
      { label: 'Seminar', cls: 'badge-gold' },
      { label: 'Education', cls: 'badge-green' },
    ],
    details: [
      { label: 'Date & Time', lines: ['Nov 22, 2026', 'Time TBA'] },
      { label: 'Location', lines: ['Babcock University'] },
      { label: 'Entry', lines: ['Free for members', 'Non-members welcome'] },
    ],
    speakerSlots: ['Sector chairpersons — topics announced on our socials'],
    ticketAmount: 0,
  },
  {
    id: 'stock-pitch-2',
    img: asset('/images/bic-stockpitch-2026-poster.webp'),
    alt: 'Stock Pitch Competition poster — ₦370,000 in prizes',
    title: 'Stock Pitch Competition 2.0',
    desc: 'Think you can identify the next winning stock? Build an investment thesis, analyze the market, and pitch before a panel of judges. ₦150,000 first prize, ₦120,000 second, ₦100,000 third — ₦370,000 total, courtesy of our sponsors.',
    tags: [
      { label: 'Competition', cls: 'badge-gold' },
      { label: '₦370k Prizes', cls: 'badge-green' },
    ],
    details: [
      { label: 'Launch', lines: ['Dec 4–6, 2026'] },
      { label: 'Pitch Day', lines: ['Announced at launch', 'Watch our socials'] },
      { label: 'Entry', lines: ['Members: Free', 'Teams of 2–4'] },
    ],
    speakerSlots: ['Judging panel: industry professionals from our partner firms'],
    ticketAmount: 0,
  },
  {
    id: 'picnic-2026',
    img: asset('/images/bic-2025-8.webp'),
    alt: 'BIC members networking at a social event',
    title: 'End-of-Year Finance Picnic',
    desc: 'Close the semester the BIC way — food, games, and conversations about markets, money, and the year ahead. Open to all members and friends of the club.',
    tags: [
      { label: 'Networking', cls: 'badge-navy' },
    ],
    details: [
      { label: 'Date & Time', lines: ['Dec 14, 2026', 'Time TBA'] },
      { label: 'Location', lines: ['Babcock University'] },
      { label: 'Entry', lines: ['Free for members'] },
    ],
    speakerSlots: [],
    ticketAmount: 0,
  },
];

const pastEvents = [
  {
    id: 'seminar-2026',
    img: asset('/images/bic-seminar-2026-poster.webp'),
    title: 'Annual Investment Seminar 2026',
    date: 'Mar 22, 2026 · 11:00 AM',
    desc: '“Building Wealth with Purpose — Turning Vision into Value.” Students joined financial experts at the 600 Seaters, BUTH for real investment insights, giveaways, and the Stock Pitch 2.0 finale with ₦370,000 in prizes — sponsored by Fundbox Financial Services, Leadway Assurance, More Ladda, and Chapel Hill Denham.',
    gallery: [
      asset('/images/bic-exec-group-2026.webp'),
      asset('/images/bic-photo-1482.webp'),
      asset('/images/bic-seminar-panel.webp'),
      asset('/images/bic-seminar-speaker.webp'),
      asset('/images/bic-seminar-practical.webp'),
      asset('/images/bic-seminar-moneyafrica.webp'),
      asset('/images/bic-presenter.webp'),
      asset('/images/bic-group-2026.webp'),
      asset('/images/bic-sponsors-2026-poster.webp'),
    ],
  },
  {
    id: 'masterclass-2026',
    img: asset('/images/masterclass-poster.webp'),
    title: 'Exclusive Investment Masterclass',
    date: 'Mar 1, 2026 · 2:00 PM',
    desc: 'Members mastered the fundamentals of crypto, the stock market, real estate, and forex — learning to analyze opportunities, manage risk, and build a strong investment foundation. Held at the BIC Boardroom, Babcock Superstore.',
    gallery: [asset('/images/bic-2025-4.webp'), asset('/images/bic-2025-10.webp')],
  },
  {
    id: 'mixer-2025',
    img: asset('/images/bic-2025-8.webp'),
    title: 'End of Semester Mixer',
    date: 'Nov 18, 2025 · 5:00 PM',
    desc: 'Members connected with peers, shared investment ideas, and built their professional networks over refreshments at the Student Center Lounge.',
    gallery: [asset('/images/bic-2025-5.webp'), asset('/images/bic-2025-6.webp')],
  },
  {
    id: 'summit-2025',
    img: asset('/images/bic-2025-2.webp'),
    title: 'Annual Student Finance Summit 2025',
    date: 'Oct 24, 2025 · 10:00 AM',
    desc: 'Our flagship summit brought industry leaders and students together for panels, masterclasses, and a student investing competition.',
    gallery: [asset('/images/bic-2025-1.webp'), asset('/images/bic-2025-3.webp'), asset('/images/bic-2025-7.webp'), asset('/images/bic-2025-9.webp')],
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
      img: e.image_url || asset('/images/bic-2025-9.webp'),
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

  // Inline status message for ticket purchase (replaces alert())
  const [ticketMsg, setTicketMsg] = useState(null); // { type: 'success' | 'error', text, eventId }

  const buyTicket = (event) => {
    if (!window.PaystackPop) {
      setTicketMsg({ type: 'error', text: 'Payment gateway is still loading — please wait a moment and try again.', eventId: event.id });
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
      onSuccess: (response) => setTicketMsg({ type: 'success', text: `Payment complete! Reference: ${response.reference}. Your ticket confirmation is on its way to ${email}.`, eventId: event.id }),
      onClose: () => setTicketMsg({ type: 'error', text: 'Transaction window closed — you can retry whenever you are ready.', eventId: event.id }),
    });
    if (!opened) setTicketMsg({ type: 'error', text: 'Payment gateway is still loading — please wait a moment and try again.', eventId: event.id });
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
      <Seo
        title="Events & Summits"
        description="Don't miss our upcoming flagship event. Register early to secure your seat — summits, workshops, and competitions for student investors."
      />
      <PageHero
        crumb="Events"
        title="Upcoming Events & Summits"
        description="Summits, masterclasses, and competitions for student investors. Register early to secure your seat."
      >
        {/* BIV-style split countdown: event info left, digits right */}
        <div className="countdown-split">
          <div className="cd-info">
            <span className="cd-kicker">Next Major Event Starts In</span>
            <span className="cd-event">BIC Welcome Seminar: The Next Chapter</span>
            <span className="cd-meta">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Nov 1, 2026 · 10:00 AM
              <span aria-hidden="true">|</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.99 1.99 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" /></svg>
              Babcock University
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
                  <h2 className="event-row-title">{event.title}</h2>
                  <p style={{ marginBottom: 24 }}>{event.desc}</p>

                  <div className="event-details">
                    {event.details.map((d) => (
                      <div className="event-detail-item" key={d.label}>
                        <div className="event-detail-icon"><CheckIcon /></div>
                        <div className="event-detail-text">
                          <h3>{d.label}</h3>
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

                  <div className="atc-row">
                    <AddToCalendar
                      event={{
                        title: event.title,
                        event_date: event.details?.[0]?.lines?.[0],
                        event_time: event.details?.[0]?.lines?.[1],
                        location: event.details?.find((d) => d.label === 'Location')?.lines?.join(', '),
                        description: event.desc,
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {event.ticketAmount > 0 && paystackConfigured ? (
                      <MagneticButton><button type="button" className="btn btn-primary" onClick={() => buyTicket(event)}>
                        Buy Ticket / RSVP (₦{event.ticketAmount.toLocaleString()})
                      </button></MagneticButton>
                    ) : event.ticketAmount > 0 ? (
                      <MagneticButton><button type="button" className="btn btn-navy" style={{ alignSelf: 'flex-start' }} onClick={() => document.getElementById('rsvp-box')?.scrollIntoView({ behavior: 'smooth' })}>
                        Reserve a Free Spot
                      </button></MagneticButton>
                    ) : (
                      <MagneticButton><button type="button" className="btn btn-navy" style={{ alignSelf: 'flex-start' }} onClick={() => document.getElementById('rsvp-box')?.scrollIntoView({ behavior: 'smooth' })}>
                        Reserve a Free Spot
                      </button></MagneticButton>
                    )}
                    {ticketMsg?.eventId === event.id && (
                      <div className={`form-status visible ${ticketMsg.type}`} style={{ width: '100%' }} role="status">
                        {ticketMsg.text}
                      </div>
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
                  <h2 className="event-row-title">{event.title}</h2>
                  <p style={{ marginBottom: 16 }}>{event.desc}</p>
                  <p style={{ color: '#55617e', fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>
                    📅 {event.date}
                  </p>
                  {event.gallery?.length > 0 && (
                    <div className="gallery-grid">
                      {event.gallery.map((src, i) => (
                        <TiltCard className="gallery-item" key={src} max={10} glare={false}>
                          <img src={src} alt={`${event.title} — photo ${i + 1}`} loading="lazy" />
                        </TiltCard>
                      ))}
                    </div>
                  )}
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
