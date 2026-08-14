import { useEffect } from 'react';

const SITE_NAME = 'Babcock Investors Club';
const DEFAULT_TITLE = 'Babcock Investors Club | Empowering Student Investors';
const DEFAULT_DESCRIPTION =
  "Babcock Investors Club is Babcock University's student-led investment community — financial literacy, events, mentorship, and resources for student investors.";

/** Upsert a <meta> tag by name or property (avoids duplicate tags in the head). */
function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Per-page SEO: sets the document title, meta description, and Open Graph /
 * Twitter tags. Renders nothing. Pass `noindex` for private pages (member,
 * admin) to keep them out of search results.
 */
export default function Seo({ title, description, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = window.location.href;

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:url', url);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);

    let robots = document.head.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex, nofollow');
    } else if (robots) {
      robots.setAttribute('content', 'index, follow');
    }

    return () => {
      // Restore the default so a page without <Seo> never inherits stale tags.
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, noindex]);

  return null;
}
