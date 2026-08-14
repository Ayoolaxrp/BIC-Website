// ============================================================================
// BIC — render check: every route at mobile / tablet / desktop widths.
// Flags console errors, page errors, horizontal overflow (with the offending
// elements), and confirms the React tree mounts. Saves screenshots to
// ../screenshots/render-check/.
//
// Usage: node scripts/render-check.cjs
// ============================================================================
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const BASE = 'https://ayoolaxrp.github.io/BIC-Website';
const ROUTES = ['/', '/about', '/membership', '/events', '/blog', '/sponsorship', '/contact', '/member', '/legal', '/admin'];
const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 667 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];
const SHOT_DIR = path.resolve(__dirname, '../../screenshots/render-check');

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const problems = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();

    for (const route of ROUTES) {
      const errs = [];
      const onConsole = (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 180)); };
      const onPageError = (e) => errs.push('pageerror: ' + String(e).slice(0, 180));
      page.on('console', onConsole);
      page.on('pageerror', onPageError);

      try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1800); // lazy chunks + animations settle

        const metrics = await page.evaluate(() => {
          const de = document.documentElement;
          const overflow = de.scrollWidth - de.clientWidth;
          const offenders = [];
          if (overflow > 1) {
            document.querySelectorAll('body *').forEach((el) => {
              const r = el.getBoundingClientRect();
              if (r.width > 0 && (r.right > window.innerWidth + 2 || r.left < -2)) {
                const tag = el.tagName.toLowerCase();
                const cls = typeof el.className === 'string' ? el.className.split(' ').slice(0, 3).join('.') : '';
                const txt = (el.textContent || '').trim().slice(0, 40).replace(/\s+/g, ' ');
                offenders.push(`${tag}.${cls} right=${Math.round(r.right)} "${txt}"`);
              }
            });
          }
          return {
            overflow,
            offenders: offenders.slice(0, 8),
            content: document.querySelector('#root')?.children.length ?? 0,
            title: document.title,
          };
        });

        const shotName = route === '/' ? 'home' : route.replace(/^\/+/, '').replace(/[/?#]/g, '_');
        await page.screenshot({ path: path.join(SHOT_DIR, `${vp.name}-${shotName}.png`) });

        // Ignore benign noise: paystack/supabase CORS-ish or aborted requests
        const realErrs = errs.filter((e) => !/Failed to load resource|net::ERR_|paystack|ResizeObserver|AbortError/i.test(e));
        const ok = metrics.overflow <= 1 && realErrs.length === 0 && metrics.content > 0;
        console.log(`${ok ? 'OK    ' : 'ISSUE '} [${vp.name}] ${route} overflow=${metrics.overflow}px tree=${metrics.content} "${metrics.title}"`);
        realErrs.slice(0, 3).forEach((e) => console.log(`       ${e}`));
        metrics.offenders.forEach((o) => console.log(`       overflow-el: ${o}`));
        if (!ok) problems.push({ vp: vp.name, route, overflow: metrics.overflow, errs: realErrs.slice(0, 3), offenders: metrics.offenders });
      } catch (e) {
        console.log(`ERROR  [${vp.name}] ${route}: ${String(e).slice(0, 160)}`);
        problems.push({ vp: vp.name, route, crash: String(e).slice(0, 200) });
      }

      page.removeListener('console', onConsole);
      page.removeListener('pageerror', onPageError);
    }
    await ctx.close();
  }

  await browser.close();
  console.log('\n=== SUMMARY ===');
  if (!problems.length) {
    console.log('ALL CHECKS PASSED — no overflow, no real console errors, content rendered at every viewport.');
  } else {
    console.log(`${problems.length} issue(s) found:`);
    problems.forEach((p) => console.log(JSON.stringify(p).slice(0, 320)));
  }
  console.log('screenshots saved to:', SHOT_DIR);
})().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
