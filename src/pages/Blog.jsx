import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import TiltCard from '../components/TiltCard';
import { fetchArticles, fetchNewsletterPosts } from '../lib/api';
import { asset } from '../lib/assets';

// Curated articles — every entry is a real, published article (verified URLs).
// BIC curates and summarizes these for its members; all credit goes to the
// original publications and authors. Links open the original article.
const CURATED_ARTICLES = [
  {
    category: 'Market Updates',
    title: 'These were the best-performing Nigerian stocks of 2025',
    publication: 'Nairametrics',
    author: 'Kelechi Mgboji',
    url: 'https://nairametrics.com/2026/01/01/these-were-the-best-performing-nigerian-stocks-of-2025/',
    published_date: 'Jan 1, 2026',
    summary:
      'Reviews the remarkable performance of the Nigerian Exchange (NGX) in 2025, where the All-Share Index closed the year with a 51.19% gain.',
    cover_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    category: 'Market Updates',
    title: 'Nigerian Stocks post 29.35% return in Q1, 4.39% in March',
    publication: 'Nairametrics',
    author: 'Kelechi Mgboji',
    url: 'https://nairametrics.com/2026/04/01/nigerian-stocks-post-29-35-return-in-q1-4-39-in-march/',
    published_date: 'Apr 1, 2026',
    summary:
      'Details the strong Q1 performance of the Nigerian stock market — a continuous quarterly growth streak and surging market capitalization.',
    cover_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    category: 'Financial Literacy',
    title: 'A Guide for Nigerians on Managing Personal Finances in Turbulent Times',
    publication: 'Nairametrics',
    author: 'Kalu Aja',
    url: 'https://nairametrics.com/2023/08/29/guide-for-nigerians-on-managing-personal-finances/',
    published_date: 'Aug 29, 2023',
    summary:
      'Foundational financial-planning guidance tailored to the Nigerian economy — strict budgeting, emergency savings, and risk mitigation.',
    cover_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    category: 'Student Finance',
    title: 'PAC Foundation Hosts Financial Literacy Day for LASU Students',
    publication: 'Nairametrics',
    author: 'Nairametrics Staff',
    url: 'https://nairametrics.com/2026/04/11/pac-foundation-hosts-financial-literacy-day-for-lasu-students/',
    published_date: 'Apr 11, 2026',
    summary:
      'A dedicated financial literacy workshop for Lagos State University students — instilling practical money-management skills early in life.',
    cover_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    category: 'Investment Strategies',
    title: "Riding Nigeria's stock surge: Practical tips and steps to enter the market safely",
    publication: 'Nairametrics',
    author: 'Kalu Aja',
    url: 'https://nairametrics.com/2026/02/07/riding-nigerias-stock-surge-practical-tips-and-steps-to-enter-the-market-safely/',
    published_date: 'Feb 7, 2026',
    summary:
      'A practical guide for novice investors entering Nigeria\u2019s equities market — equities, bonds, and exchange-traded funds (ETFs) explained.',
    cover_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    category: 'Investment Strategies',
    title: 'How to start investing in Nigerian stocks in 2025: A complete newbie\u2019s guide',
    publication: 'Nairametrics',
    author: 'Kalu Aja',
    url: 'https://nairametrics.com/2025/06/29/how-to-start-investing-in-nigerian-stocks-in-2025-a-complete-newbies-guide/',
    published_date: 'Jun 29, 2025',
    summary:
      'Walks first-time investors through opening a brokerage account, understanding financial statements, and safely navigating the NGX.',
    cover_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    category: 'Crypto & Digital Assets',
    title: 'ISA 2025: Nigeria formally recognizes cryptocurrency as securities in new SEC Act 2025',
    publication: 'Nairametrics',
    author: 'Samson Akintaro',
    url: 'https://nairametrics.com/2025/04/04/isa-2025-nigeria-formally-recognizes-cryptocurrency-as-securities-in-new-sec-act-2025/',
    published_date: 'Apr 4, 2025',
    summary:
      'Explores the landmark shift by Nigeria\u2019s SEC under the Investments and Securities Act 2025 — virtual assets formally classified as securities.',
    cover_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    category: 'Crypto & Digital Assets',
    title: 'Crypto exchanges face N10 million fine under new NRS tax rules',
    publication: 'Nairametrics',
    author: 'Samson Akintaro',
    url: 'https://nairametrics.com/2026/08/03/crypto-exchanges-face-n10-million-fine-under-new-nrs-tax-rules/',
    published_date: 'Aug 3, 2026',
    summary:
      'Reports on the regulatory enforcement framework under Nigeria Revenue Service guidelines — penalties and compliance for virtual-asset providers.',
    cover_url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    category: 'Forex & Trading',
    title: 'Naira shows price stability in unofficial market, CBN introduces FX Code',
    publication: 'Nairametrics',
    author: 'Olalekan Adigun',
    url: 'https://nairametrics.com/2025/01/28/naira-shows-price-stability-in-unofficial-market-cbn-introduces-fx-code/',
    published_date: 'Jan 28, 2025',
    summary:
      'Examines official vs parallel market exchange-rate dynamics and the CBN\u2019s introduction of the new Foreign Exchange Code.',
    cover_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    category: 'Forex & Trading',
    title: 'Trading the global markets with MetaTrader 4: A Step-by-Step Beginner\u2019s Guide',
    publication: 'Nairametrics',
    author: 'NM Partners',
    url: 'https://nairametrics.com/2025/09/20/trading-the-global-markets-with-metatrader-4-a-step-by-step-beginners-guide/',
    published_date: 'Sep 20, 2025',
    summary:
      'A foundational walkthrough for beginners entering currency and global asset trading with MetaTrader 4 — setup, charting, and risk management.',
    cover_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    category: 'Student Finance',
    title: 'How Much Money Do You Need To Start Investing?',
    publication: 'Nairametrics',
    author: 'Israel Ojoko',
    url: 'https://nairametrics.com/2024/11/30/how-much-money-do-you-need-to-start-investing/',
    published_date: 'Nov 30, 2024',
    summary:
      'Expert insights on low-barrier entry points for students and low-income earners building long-term wealth without massive capital.',
    cover_url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=600&h=400',
  },
];

const CATEGORIES = [
  'All Topics',
  'Market Updates',
  'Financial Literacy',
  'Student Finance',
  'Investment Strategies',
  'Crypto & Digital Assets',
  'Forex & Trading',
];

// Real, downloadable files generated by the club (see scripts/generate-resources.cjs)
const RESOURCES = [
  {
    name: "Beginner's Guide to Investing",
    file: asset('/resources/bic-beginners-guide-to-investing.pdf'),
    size: 'PDF · 4.4 KB',
    desc: 'BIC\u2019s own intro guide — assets, risk, costs, and how to start small in Nigeria.',
  },
  {
    name: 'Nigerian Stock Market 101',
    file: asset('/resources/bic-nigerian-stock-market-101.pdf'),
    size: 'PDF · 3.9 KB',
    desc: 'How the NGX works, how to buy shares, fees, and market jargon decoded.',
  },
  {
    name: 'Mock Trading Tournament Rules',
    file: asset('/resources/bic-mock-trading-rules.pdf'),
    size: 'PDF · 3.2 KB',
    desc: 'Official rules for BIC\u2019s simulated trading competitions.',
  },
  {
    name: 'Personal Budgeting Template',
    file: asset('/resources/bic-budget-template.csv'),
    size: 'CSV · 538 B',
    desc: 'A simple spreadsheet to plan income, spending, and savings.',
  },
  {
    name: 'Sponsorship Prospectus',
    file: asset('/resources/bic-sponsorship-deck.pdf'),
    size: 'PDF · 3.2 KB',
    desc: 'What partners get at each tier — share with your employer or brand.',
  },
];

export default function Blog() {
  const [category, setCategory] = useState('All Topics');
  const [query, setQuery] = useState('');
  const [dbArticles, setDbArticles] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let alive = true;
    fetchArticles().then((rows) => {
      if (alive && rows.length) setDbArticles(rows);
    });
    fetchNewsletterPosts().then((rows) => {
      if (alive && rows.length) setPosts(rows);
    });
    return () => {
      alive = false;
    };
  }, []);

  const articles = dbArticles.length ? dbArticles : CURATED_ARTICLES;


  // Merge admin-created articles (club-written or curated additions) with the
  // verified seed library. Normalize DB rows (source_url/source_name) and the
  // curated seed (url/publication). Club articles (body, is_external:false)
  // are deduped from the seed list so they never appear twice.
  const seed = CURATED_ARTICLES.filter(
    (s) => !dbArticles.some((d) => d.title === s.title),
  );
  const all = [...dbArticles, ...seed];
  const normalized = all.map((a) => ({
    ...a,
    url: a.url || a.source_url,
    publication: a.publication || a.source_name,
  }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalized.filter((a) => {
      const matchesCategory = category === 'All Topics' || (a.category || '') === category;
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.summary || '').toLowerCase().includes(q) ||
        (a.publication || '').toLowerCase().includes(q) ||
        (a.author || '').toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, normalized]);

  return (
    <>
      <Seo
        title="Blog & Resources"
        description="A curated reading list of the best real articles on Nigerian markets, investing, and student finance — hand-picked by the BIC research team."
      />
      <PageHero
        crumb="Blog & Resources"
        title="Insights & Education"
        description="A curated reading list of the best real articles on Nigerian markets, investing, and student finance — hand-picked by the BIC research team."
      />

      <FadeIn className="section container">
        <div className="blog-header">
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            Curated <span>Articles</span>
          </h2>
          <div className="blog-search">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search articles, topics, sources..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="blog-categories">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              className={`category-btn${category === c ? ' active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center" style={{ padding: '60px 0', color: 'var(--gray-500)' }}>
            No articles match your search. Try a different keyword or category.
          </div>
        ) : (
          <div className="blog-grid">
            {filtered.map((a) => {
              const isClub = !!(a.body && a.is_external === false);
              const Inner = (
                <>
                  <div className="blog-img">
                    <span className="blog-badge">{isClub ? 'Club Article' : a.category || 'Articles'}</span>
                    {a.cover_url ? (
                      <img src={a.cover_url} alt={a.title} loading="lazy" />
                    ) : (
                      <div className="blog-img-placeholder">BIC</div>
                    )}
                  </div>
                  <div className="blog-content">
                    <div className="blog-meta">
                      <span>{a.published_date || 'Latest'}</span>
                      {isClub ? <span>by BIC Editorial Team</span> : <span>via {a.publication}</span>}
                    </div>
                    <h3 className="blog-title">{a.title}</h3>
                    <p className="blog-desc">{a.summary}</p>
                    <div className="blog-author">
                      <div className="author-info">
                        <h6>{isClub ? 'Babcock Investors Club' : a.author || a.source_name}</h6>
                        <p style={{ color: 'var(--sky-blue)', fontWeight: 600 }}>
                          {isClub ? 'Read on the blog →' : 'Read the full article →'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              );
              return (
                <TiltCard className="blog-card" key={a.title || a.id} max={6}>
                  {isClub ? (
                    <Link to={`/blog/${a.id}`} className="blog-card-link">{Inner}</Link>
                  ) : (
                    <a href={a.url} target="_blank" rel="noreferrer" className="blog-card-link">{Inner}</a>
                  )}
                </TiltCard>
              );
            })}
          </div>
        )}

        <p className="text-center" style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginTop: 32 }}>
          Articles are curated for educational purposes. All content belongs to the original publications and authors.
        </p>
      </FadeIn>

      {/* NEWSLETTER POSTS (published by admins) */}
      {posts.length > 0 && (
        <FadeIn className="section container">
          <div className="text-center" style={{ marginBottom: 48 }}>
            <span className="section-label">From the Team</span>
            <h2 className="section-title">
              Club <span>Newsletters</span>
            </h2>
            <div className="gold-line"></div>
            <p className="section-subtitle">Official announcements and market updates from the BIC executive team.</p>
          </div>
          <div className="newsletter-list">
            {posts.map((p) => (
              <article className="newsletter-post" key={p.id}>
                <div className="newsletter-head">
                  <h3>{p.subject}</h3>
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ whiteSpace: 'pre-line' }}>{p.body}</p>
              </article>
            ))}
          </div>
        </FadeIn>
      )}

      {/* RESOURCES */}
      <FadeIn className="section bg-off-white">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 48 }}>
            <span className="section-label">Free Downloads</span>
            <h2 className="section-title">
              Educational <span>Resources</span>
            </h2>
            <div className="gold-line"></div>
            <p className="section-subtitle">
              Free, real, downloadable resources produced by the BIC team — no email required.
            </p>
          </div>
          <div className="resource-grid">
            {RESOURCES.map((r) => (
              <a
                key={r.name}
                href={r.file}
                download
                className="resource-card"
                aria-label={`Download ${r.name}`}
              >
                <div className="resource-icon">
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="resource-text">
                  <h4>{r.name}</h4>
                  <p>{r.size} · {r.desc}</p>
                </div>
                <span className="resource-download" aria-hidden="true">↓</span>
              </a>
            ))}
          </div>
        </div>
      </FadeIn>
    </>
  );
}
