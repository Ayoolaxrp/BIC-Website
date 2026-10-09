import { useEffect, useState } from 'react';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import OfflineNotice from '../components/OfflineNotice';
import AddToCalendar from '../components/AddToCalendar';
import { fetchEvents } from '../lib/api';
import { submitRecord } from '../lib/store';
import { supabaseConfigured } from '../lib/config';
import { asset } from '../lib/assets';
import { BIC_INSTAGRAM } from '../lib/contact';

// 2026/2027 session, from the club's own calendar (BIC CALENDAR.docx, Oct 2026).
// The club asked for months only: exact days are still being decided.
export const upcomingEvents = [
  {
    id: 'welcome-2026',
    when: 'November 2026',
    title: 'BIC 2026/2027: Welcome to the Next Chapter',
    desc: "The opening event of the session. We introduce BIC's new direction, this semester's programmes, the committees, upcoming competitions, investment opportunities through the club, and our relationship with CFA Society Nigeria.",
    meta: 'Babcock University. Physical or virtual.',
    flagship: true,
  },
  {
    id: 'educational-seminar-1',
    when: 'November 2026',
    title: 'First BIC Educational Seminar',
    desc: 'Our first teaching seminar of the semester. Topic to be announced.',
    meta: 'Babcock University',
  },
  {
    id: 'workshops-2026',
    when: 'From late November 2026',
    title: 'Investment workshops and sector meetings',
    desc: 'Regular sessions in Securities, Real Estate, Crypto, Forex, Finance Careers and Personal Finance, run by each sector chairperson.',
    meta: 'Babcock University',
  },
  {
    id: 'stock-pitch-launch',
    when: 'December 2026',
    title: 'BIC Stock Pitch Challenge launch',
    desc: 'The stock pitch challenge opens. Details will be shared at launch.',
    meta: 'Babcock University',
  },
  {
    id: 'picnic-2026',
    when: 'December 2026',
    title: 'BIC End-of-Year Finance Picnic',
    desc: 'An end-of-year get-together for members and friends of the club.',
    meta: 'Babcock University',
  },
  {
    id: 'careers-2027',
    when: 'January to February 2027',
    title: 'Careers in Finance: Beyond Banking',
    desc: 'A seminar on finance careers outside traditional banking, after resumption.',
    meta: 'Babcock University',
  },
  {
    id: 'stock-pitch-2027',
    when: 'January to February 2027',
    title: 'BIC Stock Pitch Competition',
    desc: 'Teams present their pitches from the December launch.',
    meta: 'Babcock University',
  },
];

// Past events: only what the club's own posters confirm.
const pastEvents = [
  {
    id: 'seminar-2026',
    poster: '/images/bic-seminar-2026-poster.webp',
    posterAlt: 'Poster for the BIC Annual Investment Seminar 2026',
    when: '22 March 2026',
    title: 'BIC Annual Investment Seminar 2026',
    desc: '"Building Wealth with Purpose: Turning Vision into Value." Students and finance professionals at the 600 Seaters, BUTH, with the Stock Pitch 2.0 finale and ₦370,000 in prizes.',
    sponsors: 'Sponsored by Fundbox Financial Services, Leadway Assurance, More Ladda (Meristem) and Chapel Hill Denham.',
    gallery: [
      ['/images/bic-panel-wide-2026.webp', 'Speaker panel on stage'],
      ['/images/bic-speaker-stage-wide-2026.webp', 'A speaker addressing the hall'],
      ['/images/bic-audience-2026.webp', 'Students in the audience'],
      ['/images/bic-moreladda-panel.webp', 'Panel session'],
      ['/images/bic-welcome-desk-2026.webp', 'Guests at the welcome desk'],
      ['/images/bic-exec-group-2026.webp', 'The BIC executive team'],
    ],
  },
  {
    id: 'masterclass-2026',
    poster: '/images/masterclass-poster.webp',
    posterAlt: 'Poster for the BIC Exclusive Investment Masterclass',
    when: '1 March 2026',
    title: 'Exclusive Investment Masterclass',
    desc: 'The fundamentals of crypto, the stock market, real estate and forex: how to analyse opportunities, manage risk and build a strong investment foundation. Held at the BIC Boardroom, Babcock Superstore.',
    gallery: [],
  },
];

export default function Events() {
  const [tab, setTab] = useState('upcoming');
  const [dbEvents, setDbEvents] = useState([]);

  // Events added in the admin console replace the calendar list once the
  // database is connected.
  useEffect(() => {
    let alive = true;
    fetchEvents().then((rows) => {
      if (alive && rows.length) setDbEvents(rows);
    });
    return () => {
      alive = false;
    };
  }, []);

  const liveUpcoming = dbEvents
    .filter((e) => e.is_upcoming !== false)
    .map((e) => ({
      id: e.id,
      when: e.event_date || 'Date to be announced',
      title: e.title,
      desc: e.description || '',
      meta: e.location || 'Babcock University',
      raw: e,
    }));
  const upcoming = liveUpcoming.length ? liveUpcoming : upcomingEvents;

  const [rsvp, setRsvp] = useState({ name: '', email: '', event: upcoming[0]?.id });
  const [rsvpState, setRsvpState] = useState(null); // null | 'sending' | 'done' | 'error'

  const handleRsvp = async (e) => {
    e.preventDefault();
    setRsvpState('sending');
    const event = upcoming.find((ev) => ev.id === rsvp.event) || upcoming[0];
    const res = await submitRecord('rsvps', { name: rsvp.name, email: rsvp.email, event_name: event?.title });
    setRsvpState(res.ok ? 'done' : 'error');
  };

  return (
    <>
      <Seo
        title="Events"
        description="BIC's 2026/2027 calendar: the Welcome to the Next Chapter event, seminars, sector workshops, the stock pitch challenge and more."
      />
      <PageHero
        crumb="Events"
        title="What's coming up."
        description="The 2026/2027 session at Babcock University. Dates are confirmed on our socials as they are decided."
      />

      <section className="section">
        <div className="container">
          <div className="tabs" role="tablist" aria-label="Events">
            <button type="button" role="tab" aria-selected={tab === 'upcoming'} className={`tab-btn${tab === 'upcoming' ? ' active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
            <button type="button" role="tab" aria-selected={tab === 'past'} className={`tab-btn${tab === 'past' ? ' active' : ''}`} onClick={() => setTab('past')}>Past</button>
          </div>

          {tab === 'upcoming' ? (
            <ol className="event-timeline">
              {upcoming.map((ev) => (
                <li key={ev.id} className={ev.flagship ? 'flagship' : ''}>
                  <p className="et-when">{ev.when}</p>
                  <div className="et-body">
                    {ev.flagship && <span className="badge badge-green">Next major event</span>}
                    <h2>{ev.title}</h2>
                    {ev.desc && <p>{ev.desc}</p>}
                    <p className="et-meta">{ev.meta}</p>
                    {ev.raw?.event_date && <AddToCalendar event={ev.raw} />}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="past-list">
              {pastEvents.map((ev) => (
                <article key={ev.id} className="past-event">
                  <img className="past-poster" src={asset(ev.poster)} alt={ev.posterAlt} loading="lazy" decoding="async" />
                  <div>
                    <p className="et-when">{ev.when}</p>
                    <h2>{ev.title}</h2>
                    <p>{ev.desc}</p>
                    {ev.sponsors && <p className="et-meta">{ev.sponsors}</p>}
                    {ev.gallery.length > 0 && (
                      <div className="past-gallery">
                        {ev.gallery.map(([src, alt]) => (
                          <img key={src} src={asset(src)} alt={alt} loading="lazy" decoding="async" />
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
              <p className="h-caption">
                More photos and write-ups from past events are on the way. Meanwhile, see{' '}
                <a className="text-link" href={BIC_INSTAGRAM} target="_blank" rel="noreferrer">our Instagram</a>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* RSVP */}
      <section className="section bg-off-white" id="rsvp-box">
        <div className="container rsvp-layout">
          <div>
            <h2 className="sec-title">Save your seat.</h2>
            <p className="sec-sub">Tell us which event you are coming to and we will send you the details once the date is set.</p>
          </div>
          {!supabaseConfigured ? (
            <OfflineNotice
              title="RSVP"
              text="Online RSVPs are not switched on yet."
              subject="Event RSVP"
              message={'Hello BIC, I would like to attend: \nName: '}
            />
          ) : rsvpState === 'done' ? (
            <div className="form-status visible success" role="status">You're on the list. We'll email {rsvp.email} when the date is confirmed.</div>
          ) : (
            <form className="contact-form-box" onSubmit={handleRsvp}>
              <div className="form-group">
                <label htmlFor="r-name">Full name</label>
                <input id="r-name" type="text" required autoComplete="name" value={rsvp.name} onChange={(e) => setRsvp({ ...rsvp, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="r-email">Email</label>
                <input id="r-email" type="email" required autoComplete="email" placeholder="you@babcock.edu.ng" value={rsvp.email} onChange={(e) => setRsvp({ ...rsvp, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="r-event">Event</label>
                <select id="r-event" value={rsvp.event} onChange={(e) => setRsvp({ ...rsvp, event: e.target.value })}>
                  {upcoming.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={rsvpState === 'sending'}>
                {rsvpState === 'sending' ? 'Sending…' : 'RSVP'}
              </button>
              {rsvpState === 'error' && <div className="form-status visible error" role="alert">That didn't send. Please message us instead.</div>}
            </form>
          )}
        </div>
      </section>
    </>
  );
}
