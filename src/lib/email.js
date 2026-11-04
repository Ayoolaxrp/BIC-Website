// One email rule for the application form, the portal sign-up and the checkout server.
// Any real-looking address is fine (school, Gmail, Yahoo, anything). Only broken shapes and
// obvious typos of the big providers are turned away, because the club cannot email a typo.
// shortcut: the typo lists are hand-picked, add to them when a new common typo shows up.
const TYPO_TLDS = new Set(['comn', 'con', 'cmo', 'ocm', 'vom', 'xom', 'coom', 'comm', 'coml', 'cim', 'clm', 'cpm']);
const TYPO_DOMAINS = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmil.com': 'gmail.com',
  'gnail.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmaill.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.cm': 'gmail.com',
  'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yhoo.com': 'yahoo.com', 'yahoo.cm': 'yahoo.com',
  'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotnail.com': 'hotmail.com', 'hotmail.co': 'hotmail.com',
  'outlok.com': 'outlook.com', 'outloook.com': 'outlook.com', 'outlookk.com': 'outlook.com',
  'iclod.com': 'icloud.com', 'icoud.com': 'icloud.com',
};

/** Returns '' when the address is fine, otherwise a message to show the person. */
export function emailProblem(value) {
  const email = String(value ?? '').trim().toLowerCase();
  const [local, domain, ...extra] = email.split('@');
  const labels = domain ? domain.split('.') : [];
  const tld = labels.at(-1) ?? '';
  const badShape =
    extra.length > 0 || !local || !domain || email.length > 320 || local.length > 64 ||
    !/^[a-z0-9._%+'-]+$/.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..') ||
    labels.length < 2 || labels.some((l) => l.length > 63 || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(l)) ||
    !/^[a-z]{2,}$/.test(tld);
  if (badShape) return 'Enter a valid email address, like name@example.com.';
  const fixed = TYPO_DOMAINS[domain] ?? (TYPO_TLDS.has(tld) ? [...labels.slice(0, -1), 'com'].join('.') : '');
  return fixed ? `Check the spelling. Did you mean ${local}@${fixed}?` : '';
}
