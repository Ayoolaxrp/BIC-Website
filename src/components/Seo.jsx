import { useEffect } from 'react';

const SITE_NAME = 'Babcock Investors Club';
const DEFAULT_TITLE = 'Babcock Investors Club';
const DEFAULT_DESCRIPTION =
  'Babcock Investors Club is the student investment club at Babcock University. Weekly sessions on stocks, forex, crypto and real estate, run by students.';
const SITE_URL = 'https://www.babcockinvestorsclub.com';
const SOCIAL_IMAGE = `${SITE_URL}/images/bic-2025-1.webp`;

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

function upsertCanonical(url) {
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
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
    const path = window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/+$/, '');
    const url = `${SITE_URL}${path}`;

    document.title = fullTitle;
    upsertCanonical(url);
    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'en_NG');
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', SOCIAL_IMAGE);
    upsertMeta('property', 'og:image:alt', `${SITE_NAME} members at a club event`);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', SOCIAL_IMAGE);
    upsertMeta('name', 'twitter:image:alt', `${SITE_NAME} members at a club event`);

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
