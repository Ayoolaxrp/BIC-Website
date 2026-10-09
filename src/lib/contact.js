/**
 * Club contact details. Single source for every page.
 * Verified against the club's own event posters (Masterclass Mar 2026,
 * Investment Seminar 2026): email, phone and social handles.
 */
export const CLUB_EMAIL = 'babcockinvestorsclub@gmail.com';
export const CLUB_PHONE = '+234 811 688 3025';
export const CLUB_PHONE_E164 = '2348116883025';
export const CLUB_LOCATION = 'Babcock University, Ilishan-Remo, Ogun State';
export const CLUB_TAGLINE = 'Building a community of smart, confident investors.';
export const RESPONSE_TIME = 'within 72 hours';

export const BIC_INSTAGRAM = 'https://www.instagram.com/babcock_investors_club/';
export const BIC_LINKEDIN = 'https://www.linkedin.com/company/babcock-investors-club/';

export const mailto = (subject = '', body = '') =>
  `mailto:${CLUB_EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;

export const whatsapp = (text = '') =>
  `https://wa.me/${CLUB_PHONE_E164}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
