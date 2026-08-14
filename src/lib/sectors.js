/**
 * BIC sector communities — the interest tracks members join. Each has a
 * chairperson on the executive team, and the member portal links to the
 * group chat for each sector.
 *
 * GROUP_LINKS are placeholders. Replace them with the real WhatsApp /
 * Telegram invite links (via the README "Community group links" section)
 * before launch.
 */
export const SECTORS = [
  { value: 'Crypto', label: 'Crypto & Digital Assets', desc: 'Blockchain, digital assets, and Web3 investing.' },
  { value: 'Forex', label: 'Forex & Trading', desc: 'Currency markets, technical analysis, and trading.' },
  { value: 'Securities', label: 'Securities & Equities', desc: 'Stocks, bonds, ETFs, and the Nigerian Exchange.' },
  { value: 'Real Estate', label: 'Real Estate', desc: 'Property markets, REITs, and land investment.' },
  { value: 'General', label: 'General / All Areas', desc: 'Exposure across every track — the best place to start.' },
];

export const SECTOR_VALUES = SECTORS.map((s) => s.value);

/** Real chat links to be provided by the club; `#` = not set yet. */
export const GROUP_LINKS = {
  Crypto: 'https://chat.whatsapp.com/REPLACE_CRYPTO',
  Forex: 'https://chat.whatsapp.com/REPLACE_FOREX',
  Securities: 'https://chat.whatsapp.com/REPLACE_SECURITIES',
  'Real Estate': 'https://chat.whatsapp.com/REPLACE_REALESTATE',
  General: 'https://chat.whatsapp.com/REPLACE_GENERAL',
};

export const sectorLabel = (value) =>
  SECTORS.find((s) => s.value === value)?.label || value || 'General / All Areas';
