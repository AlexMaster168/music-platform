import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const groot = process.env.GLOBAL_NM;
const pw = await import(pathToFileURL(path.join(groot, 'playwright', 'index.js')).href);
const chromium = pw.chromium ?? pw.default.chromium;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shots = path.join(__dirname, 'shots');
const BASE = 'http://localhost:3000';

let p = 0, f = 0;
const ok = (n, c, x = '') => (c ? (p++, console.log('  ✓ ' + n)) : (f++, console.log('  ✗ ' + n + ' ' + x)));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });
try {
   // логин админом
   await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
   await page.fill('input[type="email"]', 'admin@demo.dev');
   await page.fill('input[type="password"]', 'admin1234');
   await page.click('button[type="submit"]');
   await page.waitForTimeout(1800);
   ok('админ вошёл', (await page.textContent('body')).includes('Админ'));

   // открыть трек
   await page.goto(BASE, { waitUntil: 'networkidle' });
   await page.waitForTimeout(1000);
   await page.click('text=Midnight City', { timeout: 5000 });
   await page.waitForTimeout(1500);
   const body = await page.textContent('body');
   ok('на странице трека видна кнопка "Редактировать"', body.includes('Редактировать'));
   ok('видна кнопка "Удалить"', body.includes('Удалить'));
   // раскрыть форму
   await page.click('text=Редактировать', { timeout: 5000 }).catch(() => {});
   await page.waitForTimeout(800);
   await page.screenshot({ path: path.join(shots, 'admin-track.png') });

   // поиск с фильтрами
   await page.goto(`${BASE}/search?q=a`, { waitUntil: 'networkidle' });
   await page.waitForTimeout(1200);
   const sb = await page.textContent('body');
   ok('на поиске есть фильтр "Все жанры"', sb.includes('Все жанры'));
   ok('на поиске есть фильтр "Все языки"', sb.includes('Все языки'));
   await page.screenshot({ path: path.join(shots, 'search-filters.png') });
} catch (e) {
   console.error('upal:', e);
   f++;
} finally {
   await browser.close();
}
console.log(`\n==== ADMIN UI: ${p} passed, ${f} failed ====`);
process.exit(f ? 1 : 0);
