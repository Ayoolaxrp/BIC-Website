/**
 * Generates the club's downloadable resources (real PDFs + CSV) into public/resources/.
 * Dependency-free: writes minimal valid PDF 1.4 documents with Helvetica text.
 * Usage: node scripts/generate-resources.cjs
 *
 * Content reflects real, researched facts about the Nigerian market (NGX,
 * CSCS, SEC) and standard competition/budgeting practice, as of 2026.
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'resources');

// ---------- tiny PDF writer ----------
function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** lines: [{ bold:boolean, text:string, size:number, gap:number }] */
function buildPdf(title, lines) {
  const pageW = 612;
  const pageH = 792;
  const margin = 56;
  const maxChars = 92;

  const contentLines = [{ bold: true, text: title, size: 17, gap: 26 }, ...lines];

  // Layout pages: compute wrapped lines and paginate.
  const pages = [];
  let y = pageH - margin;
  let stream = [];

  function newPage() {
    pages.push(stream.join('\n'));
    stream = [];
    y = pageH - margin;
  }

  for (const ln of contentLines) {
    const size = ln.size || 11;
    const lineH = size + 6;
    for (const sub of wrap(ln.text, maxChars)) {
      if (y < 70) newPage();
      const font = ln.bold ? '/F2' : '/F1';
      stream.push(`BT ${font} ${size} Tf ${margin} ${y} Td (${esc(sub)}) Tj ET`);
      y -= lineH;
    }
    y -= ln.gap || 8;
  }
  pages.push(stream.join('\n'));

  // Correct, deterministic object numbering:
  //   1 Catalog · 2 Pages · 3 F1 (Helvetica) · 4 F2 (Helvetica-Bold)
  //   then one Page object per page, then one content stream per page.
  const n = pages.length;
  const objects = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>'); // 1
  objects.push(`<< /Type /Pages /Kids [${pages.map((_, i) => `${5 + i} 0 R`).join(' ')}] /Count ${n} >>`); // 2
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'); // 3  F1
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'); // 4  F2
  pages.forEach((_, i) => {
    const contentObj = 5 + n + i;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObj} 0 R >>`,
    ); // 5..5+n-1
  });
  pages.forEach((s) => {
    objects.push(`<< /Length ${s.length} >>\nstream\n${s}\nendstream`); // 5+n..5+2n-1
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.forEach((o) => {
    pdf += String(o).padStart(10, '0') + ' 00000 n \n';
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return pdf;
}

// ---------- content (researched, real facts) ----------
const resources = {
  'bic-beginners-guide-to-investing.pdf': buildPdf("BIC — The Beginner's Guide to Investing", [
    { bold: true, text: 'Babcock Investors Club · Educational Series #1', size: 10, gap: 22 },
    { text: 'Investing means putting money to work today so it can grow over time. Unlike saving, which preserves money, investing builds wealth. The earlier you start, the more you benefit from compound interest — the engine that turns small, consistent contributions into meaningful sums over decades.', size: 11, gap: 12 },
    { bold: true, text: '1. Know your goal and time horizon', gap: 6 },
    { text: 'Money you need within a year belongs in savings. Money for goals three or more years away — graduation, a business, retirement — can tolerate market ups and downs and belongs in investments.', size: 11, gap: 12 },
    { bold: true, text: '2. Understand the asset classes', gap: 6 },
    { text: 'Stocks: ownership in companies. ETFs and index funds: baskets of stocks that spread risk. Mutual funds: professionally managed pools. Fixed income: bonds and Nigerian treasury bills, lower risk. Crypto and forex: high volatility — size positions carefully.', size: 11, gap: 12 },
    { bold: true, text: '3. Start in Nigeria the right way', gap: 6 },
    { text: 'You cannot open a CSCS account directly — you must go through a SEC-licensed stockbroker (e.g. Stanbic IBTC Stockbrokers, Meristem, CardinalStone, or a digital platform like Bamboo, Trove or Chaka). Provide your BVN, a government ID, proof of address, and a passport photo. Your broker creates your CSCS account (24 hours to 3 business days) and your shares are held in your own name — safe even if the broker shuts down.', size: 11, gap: 12 },
    { bold: true, text: '4. Costs you will pay', gap: 6 },
    { text: 'Trading on the NGX typically costs between 1.5% and 2.5% of trade value: brokerage commission (0.75%–1.35%), SEC fee (0.30% on buys), NGX fee (0.30% on sells), CSCS fee (0.30%), stamp duty (0.08%), and 7.5% VAT on the fees. Small fees matter — factor them into returns.', size: 11, gap: 12 },
    { bold: true, text: '5. The Nigerian market today', gap: 6 },
    { text: 'The NGX All-Share Index rose roughly 45.9% in 2023, about 37.65% in 2024, and a further 51.19% in 2025 (closing at a record 155,613.03 points on Dec 31, 2025) — one of the strongest multi-year runs in nearly two decades. The NGX also caps daily moves at ±10%, a built-in circuit breaker. Past performance never guarantees future returns.', size: 11, gap: 12 },
    { bold: true, text: '6. Build the habit', gap: 6 },
    { text: 'Invest a fixed amount regularly — weekly or monthly — regardless of price. This is dollar-cost averaging: it removes emotion and buys more shares when prices are low. Diversify across sectors. Never invest money you cannot afford to lose, and avoid anyone promising guaranteed returns. Check the SEC register (sec.gov.ng) to verify a broker.', size: 11, gap: 14 },
    { text: 'Disclaimer: This guide is for educational purposes only and is not financial advice. Always do your own research.', size: 9, gap: 4 },
  ]),

  'bic-nigerian-stock-market-101.pdf': buildPdf('BIC — Nigerian Stock Market 101', [
    { bold: true, text: 'Babcock Investors Club · Educational Series #2', size: 10, gap: 22 },
    { bold: true, text: 'What is the NGX?', gap: 6 },
    { text: "The Nigerian Exchange (NGX), headquartered in Lagos, is Nigeria's official stock exchange — the marketplace where shares of public companies (banks, telcos, consumer goods, industrials) are bought and sold. It lists roughly 150+ equities within a broader market of nearly 400 listed securities (including ETFs, REITs and bonds).", size: 11, gap: 12 },
    { bold: true, text: 'How to buy your first stock', gap: 6 },
    { text: '1) Open a CSCS account through a SEC-licensed stockbroker. 2) Fund your brokerage account from your bank. 3) Place a buy order — a market order buys immediately at the current price; a limit order only fills at a price you choose. 4) Under the T+1 settlement cycle (effective June 2026), trades settle the next business day, and your shares appear in your CSCS account. You receive an electronic contract note as proof.', size: 11, gap: 12 },
    { bold: true, text: 'How the market is regulated', gap: 6 },
    { text: 'The Securities and Exchange Commission (SEC) regulates Nigeria’s capital market under the Investments and Securities Act. It keeps a public register of licensed operators — always verify a broker at sec.gov.ng. As of January 2026, brokers must hold a minimum capital base of ₦600 million, strengthening protection for retail investors.', size: 11, gap: 12 },
    { bold: true, text: 'Reading the market', gap: 6 },
    { text: 'The NGX All-Share Index (ASI) tracks the overall market — it is a thermometer, not an instruction. Watch sector performance, company earnings, and interest rates. Learn to read a P/E ratio (price vs. earnings) before judging whether a share is cheap or expensive.', size: 11, gap: 12 },
    { bold: true, text: 'Costs to expect', gap: 6 },
    { text: 'Brokerage commission (0.75%–1.35%), SEC fee (0.30% buys), NGX fee (0.30% sells), CSCS fee (0.30%), stamp duty (0.08%) and 7.5% VAT — total 1.5%–2.5% per trade. Factor fees into your returns.', size: 11, gap: 12 },
    { bold: true, text: 'Key rules for students', gap: 6 },
    { text: "Start with money you can afford to lose. Practise with virtual trading — like BIC's mock tournaments. Avoid crowd-mentality buying after a rally. Build a watchlist and study two or three companies in depth before ever buying. Remember the NGX ±10% daily price limit.", size: 11, gap: 14 },
    { text: 'Disclaimer: Educational content only — not investment advice.', size: 9, gap: 4 },
  ]),

  'bic-mock-trading-rules.pdf': buildPdf('BIC — Mock Trading Tournament Rules', [
    { bold: true, text: 'Babcock Investors Club · Tournament Handbook', size: 10, gap: 22 },
    { bold: true, text: '1. Format', gap: 6 },
    { text: 'The tournament runs for a fixed window (typically 4–8 weeks). Each participant starts with a virtual portfolio of ₦1,000,000 and trades in a simulated environment using real-world price data for NGX-listed equities and ETFs (and, where enabled, forex and crypto pairs).', size: 11, gap: 12 },
    { bold: true, text: '2. Trading rules', gap: 6 },
    { text: 'Simulated transaction costs of 0.5% per trade apply — this discourages reckless day-trading and teaches fee awareness. No single stock may exceed 25% of portfolio value at purchase (diversification cap). Orders execute at the simulated price at the time of submission. Leverage and derivatives are not permitted unless announced.', size: 11, gap: 12 },
    { bold: true, text: '3. Scoring — risk-adjusted returns', gap: 6 },
    { text: 'Ranking is NOT by raw return alone. Winners are judged by the Sharpe ratio: the portfolio’s excess return divided by its volatility. This rewards consistent, controlled returns over gambling on high-beta stocks. A portfolio that loses more than 30% of its starting value (maximum drawdown) is disqualified — risk management is part of the game.', size: 11, gap: 12 },
    { bold: true, text: '4. Submitting your strategy', gap: 6 },
    { text: 'Participants may earn bonus points for documenting a strategy — a trade journal and investment thesis explaining each position. Judges award the bonus at the closing ceremony.', size: 11, gap: 12 },
    { bold: true, text: '5. Prizes & recognition', gap: 6 },
    { text: 'Top performers receive certificates and prizes, and results are celebrated on the club’s channels. Top ten finishers get fast-track entry into the club’s analyst development track.', size: 11, gap: 12 },
    { bold: true, text: '6. Code of conduct', gap: 6 },
    { text: 'No collusion, no multi-accounting, no manipulation of the simulator. Any violation leads to disqualification. Play fair — the point is to learn how real markets reward discipline.', size: 11, gap: 14 },
    { text: 'Rules may be updated per edition. The current edition’s rules override this handbook.', size: 9, gap: 4 },
  ]),

  'bic-sponsorship-deck.pdf': buildPdf('BIC — Sponsorship Prospectus 2026', [
    { bold: true, text: 'Babcock Investors Club · Babcock University, Ilishan-Remo, Ogun State', size: 10, gap: 20 },
    { bold: true, text: 'Who we are', gap: 6 },
    { text: 'The Babcock Investors Club is Babcock University’s premier student-led investment community — 50+ active members and a campus reach of 13,000+ students through financial literacy programmes, masterclasses, sector forums, and flagship events.', size: 11, gap: 12 },
    { bold: true, text: 'Why partner with us', gap: 6 },
    { text: 'Direct access to ambitious, career-ready students; premium campus brand visibility; high-impact speaking and workshop opportunities; a fast-track recruitment channel; and measurable community impact for your CSR goals.', size: 11, gap: 12 },
    { bold: true, text: 'Our members pursue growth in', gap: 6 },
    { text: 'Finance & Investment, Entrepreneurship, Business Strategy, Technology & Innovation, Wealth Building, and Leadership Development — across dedicated sector communities in Crypto, Forex, Securities & Equities, and Real Estate, each led by an executive.', size: 11, gap: 12 },
    { bold: true, text: 'Partnership tiers', gap: 6 },
    { text: 'Headline Partner — maximum visibility, headline speaking slot at our annual Summit, custom-branded programme, year-round recognition. Gold Partner — prominent logo placement, speaking slot at a major workshop, newsletter blast, CV pool access. Silver Partner — website logo placement, event recognition, social shoutouts, VIP passes.', size: 11, gap: 12 },
    { bold: true, text: 'Audience at a glance', gap: 6 },
    { text: '50+ active registered members · 13,000+ campus reach · 25+ seminars and workshops · students across finance, business, technology, and allied disciplines · Gen Z decision-makers aged 17–25.', size: 11, gap: 12 },
    { bold: true, text: 'Next step', gap: 6 },
    { text: 'Use the inquiry form on our website and the partnerships team will respond within 24 hours. Custom engagements are welcome — see the Sponsorship page for tier details.', size: 11, gap: 14 },
    { text: '© 2026 Babcock Investors Club. Figures as of 2026.', size: 9, gap: 4 },
  ]),

  'bic-budget-template.csv': [
    'Category,Monthly Allowance (NGN),Planned (NGN),Actual (NGN),Difference (NGN)',
    'Food & groceries,15000,,,',
    'Transport (shuttle/keke),5000,,,',
    'Data & airtime,5000,,,',
    'Academic materials,4000,,,',
    'Personal care,3000,,,',
    'Social & events,3000,,,',
    'Savings & investing (pay yourself first!),10000,,,',
    'Total,45000,,,',
    '',
    'Rule of thumb: the student 50/30/20 split — 50% needs, 30% wants, 20% future.',
    'Move the 20% the day your allowance drops, not at month-end.',
    'Example for a ₦50,000 monthly allowance: needs ₦25,000 · wants ₦15,000 · future ₦10,000.',
  ].join('\n'),
};

// ---------- write ----------
fs.mkdirSync(OUT, { recursive: true });
let log = '';
for (const [name, content] of Object.entries(resources)) {
  const file = path.join(OUT, name);
  fs.writeFileSync(file, content, name.endsWith('.csv') ? 'utf8' : 'latin1');
  log += `${name}  (${fs.statSync(file).size} bytes)\n`;
}
console.log(log);
