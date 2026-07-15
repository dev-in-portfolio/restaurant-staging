const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const report = JSON.parse(fs.readFileSync('out/phase4-sync-report.json', 'utf8'));
const root = path.resolve('staging');
const base = 'http://127.0.0.1:4173';
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
];

function pages(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'restaurant.json') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...pages(full));
    else if (entry.name.toLowerCase().endsWith('.html')) out.push(full);
  }
  return out.sort();
}

function urlPath(relative) {
  return relative.split(path.sep).map(encodeURIComponent).join('/');
}

async function inspectPage(page, url, label) {
  const failures = [];
  const pageErrors = [];
  const badResponses = [];
  page.removeAllListeners();
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('response', response => {
    if (
      response.url().startsWith(`${base}/`) &&
      response.status() >= 400 &&
      !response.url().endsWith('/favicon.ico')
    ) {
      badResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(60);
  const checks = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(element => element.id).filter(Boolean);
    return {
      title: document.title.trim(),
      lang: document.documentElement.lang.trim(),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      mainCount: document.querySelectorAll('main').length,
      duplicateIds: [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))],
      textLength: document.body.innerText.replace(/\s+/g, ' ').trim().length,
    };
  });

  if (!response || response.status() >= 400) failures.push(`${label}: navigation ${response?.status() ?? 'none'}`);
  if (!checks.title) failures.push(`${label}: empty title`);
  if (!checks.lang) failures.push(`${label}: missing lang`);
  if (checks.mainCount !== 1) failures.push(`${label}: main count ${checks.mainCount}`);
  if (checks.overflow > 12) failures.push(`${label}: horizontal overflow ${checks.overflow}px`);
  if (checks.duplicateIds.length) failures.push(`${label}: duplicate ids ${checks.duplicateIds.join(',')}`);
  if (checks.textLength < 180) failures.push(`${label}: insufficient visible text ${checks.textLength}`);
  failures.push(...pageErrors.map(error => `${label}: pageerror ${error}`));
  failures.push(...badResponses.map(error => `${label}: local response ${error}`));
  return failures;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  let pageLoads = 0;
  try {
    for (const target of report.targets) {
      const site = path.join(root, 'restaurants', target.slug);
      const htmlFiles = pages(site);
      for (const viewport of viewports) {
        const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
        const page = await context.newPage();
        for (const file of htmlFiles) {
          const relative = path.relative(root, file);
          const label = `${target.slug}/${path.relative(site, file)} @ ${viewport.name}`;
          failures.push(...await inspectPage(page, `${base}/${urlPath(relative)}`, label));
          pageLoads += 1;
        }
        await context.close();
      }
    }

    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      const response = await page.goto(`${base}/restaurants/index.html`, { waitUntil: 'domcontentloaded' });
      pageLoads += 1;
      if (!response || response.status() >= 400) {
        failures.push(`staging directory @ ${viewport.name}: navigation failure`);
      }
      const cardCount = await page.locator('main article').count();
      if (cardCount !== report.directoryCardCount) {
        failures.push(`staging directory @ ${viewport.name}: expected ${report.directoryCardCount} cards, found ${cardCount}`);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 12) failures.push(`staging directory @ ${viewport.name}: horizontal overflow ${overflow}px`);
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const result = {
    restaurants: report.targets.length,
    pageLoads,
    viewports: viewports.map(viewport => viewport.name),
    failures,
  };
  fs.writeFileSync('out/phase4-browser-report.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ restaurants: result.restaurants, pageLoads, failures: failures.length }, null, 2));
  if (failures.length) {
    console.error(failures.slice(0, 100).join('\n'));
    process.exit(1);
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
