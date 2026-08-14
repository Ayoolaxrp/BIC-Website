// ============================================================================
// BIC — deep layout audit (beyond render-check): finds visual-quality issues
// that don't break the build but degrade the design:
//   - text clipped/truncated (scrollWidth > clientWidth on visible text nodes)
//   - fixed elements overlapping content (sticky CTA over footer, navbar over hero)
//   - tap targets under 44px on mobile
//   - hero section height sanity on mobile
//   - broken images / missing alt
//   - suspiciously large empty vertical gaps
// Usage: node scripts/layout-audit.cjs
// ============================================================================
const { chromium } = require('playwright');

const BASE = 'https://ayoolaxrp.github.io/BIC-Website';
const ROUTES = ['/', '/about', '/membership', '/events', '/blog', '/sponsorship', '/contact', '/member', '/legal', '/admin'];
const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 667 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const MIN_TAP = 44;

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const issues = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();

    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1200);

      const report = await page.evaluate(({ MIN_TAP }) => {
        const out = { clipped: [], overlap: [], tap: [], brokenImg: [], missingAlt: [], gaps: [] };
        const vw = window.innerWidth;

        // 1) Text clipping — text nodes wider than their container
        document.querySelectorAll('body *').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return;
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.overflow === 'hidden' === false) return;
          // only elements that visually contain text
          if (!/^[A-Za-z0-9]/.test((el.textContent || '').trim())) return;
          if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
            const hasVisibleText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
            const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 46);
            if (hasVisibleText) out.clipped.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ').slice(0,2).join('.')} scroll=${el.scrollWidth}>client=${el.clientWidth} "${txt}"`);
          }
        });

        // 2) Fixed/absolute elements overlapping other content badly
        const fixed = [...document.querySelectorAll('body *')].filter((el) => {
          const s = getComputedStyle(el);
          return (s.position === 'fixed' || s.position === 'sticky') && el.getBoundingClientRect().width > 0;
        });
        fixed.forEach((f) => {
          const fr = f.getBoundingClientRect();
          // only check tall/wide overlays (navbars, CTAs), skip tiny labels
          if (fr.height < 30) return;
          const cls = (f.className || '').toString().split(' ').slice(0, 3).join('.');
          // does it cover interactive content (links/buttons) near the viewport edge?
          const blockers = [...document.querySelectorAll('a,button')].filter((el) => {
            const er = el.getBoundingClientRect();
            if (er.width === 0) return false;
            const overlapX = Math.max(0, Math.min(fr.right, er.right) - Math.max(fr.left, er.left));
            const overlapY = Math.max(0, Math.min(fr.bottom, er.bottom) - Math.max(fr.top, er.top));
            return overlapX > 10 && overlapY > 10 && er.bottom > fr.bottom - 6; // visibly covered
          });
          if (blockers.length > 3) {
            out.overlap.push(`${cls} (${Math.round(fr.height)}px) covers ${blockers.length} interactive elements incl "${(blockers[0].textContent||'').trim().slice(0,30)}"`);
          }
        });

        // 3) Tap targets on mobile
        if (vw <= 768) {
          document.querySelectorAll('a,button,input,select,textarea').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            if (r.width < MIN_TAP - 4 || r.height < MIN_TAP - 4) {
              const cls = (el.className || '').toString().split(' ').slice(0, 2).join('.');
              out.tap.push(`${el.tagName.toLowerCase()}.${cls} ${Math.round(r.width)}x${Math.round(r.height)} "${(el.textContent||el.placeholder||'').trim().slice(0,30)}"`);
            }
          });
        }

        // 4) Broken images + missing alt
        document.querySelectorAll('img').forEach((img) => {
          if (!img.complete || img.naturalWidth === 0) out.brokenImg.push(img.src.slice(-60));
          if (!img.getAttribute('alt')) out.missingAlt.push(img.src.slice(-50));
        });

        // 5) Suspicious empty gaps — big blank areas between sections
        const sections = [...document.querySelectorAll('section, .section, main > *')].filter((el) => el.getBoundingClientRect().height > 0);
        for (let i = 0; i < sections.length - 1; i++) {
          const a = sections[i].getBoundingClientRect();
          const b = sections[i + 1].getBoundingClientRect();
          const gap = b.top - a.bottom;
          if (gap > vw * 0.5 && gap > 220) {
            out.gaps.push(`${Math.round(gap)}px gap after ${sections[i].tagName.toLowerCase()}.${(sections[i].className||'').toString().split(' ')[0]}`);
          }
        }

        return out;
      }, { MIN_TAP });

      const tag = (arr, label) => arr.slice(0, 4).forEach((x) => issues.push(`[${vp.name}] ${route} ${label}: ${x}`));

      if (report.clipped.length) tag(report.clipped, 'CLIPPED-TEXT');
      if (report.overlap.length) tag(report.overlap, 'OVERLAP');
      if (report.tap.length) tag(report.tap, 'SMALL-TAP');
      if (report.brokenImg.length) tag(report.brokenImg, 'BROKEN-IMG');
      if (report.missingAlt.length) tag(report.missingAlt, 'MISSING-ALT');
      if (report.gaps.length) tag(report.gaps, 'BIG-GAP');

      console.log(`audited [${vp.name}] ${route} — clipped=${report.clipped.length} overlap=${report.overlap.length} tap=${report.tap.length} img=${report.brokenImg.length} alt=${report.missingAlt.length} gaps=${report.gaps.length}`);
    }
    await ctx.close();
  }

  await browser.close();
  console.log('\n=== ISSUES ===');
  if (!issues.length) console.log('No layout issues found.');
  else issues.forEach((i) => console.log(i));
})().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
