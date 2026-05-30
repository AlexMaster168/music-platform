// Скриншоты приложения для README. Запуск: GLOBAL_NM=$(npm root -g) node scripts/docs-shots.mjs
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

const groot = process.env.GLOBAL_NM;
const pw = await import(pathToFileURL(path.join(groot, 'playwright', 'index.js')).href);
const chromium = pw.chromium ?? pw.default.chromium;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..', '..', 'docs', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const BASE = 'http://localhost:3000';
const API = 'http://localhost:5000/api';
const shot = (page, name) => page.screenshot({ path: path.join(outDir, name) });
const wait = (page, ms = 1300) => page.waitForTimeout(ms);

// нужные id
const home = await (await fetch(`${API}/home`)).json();
const track = home.trending.find((t) => t.name === 'Midnight City') || home.trending[0];
const artistId = typeof track.artistId === 'object' ? track.artistId._id : track.artistId;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function login(email, password) {
   await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
   await page.fill('input[type="email"]', email);
   await page.fill('input[type="password"]', password);
   await page.click('button[type="submit"]');
   await wait(page, 1800);
}

try {
   // 1. Главная
   await page.goto(BASE, { waitUntil: 'networkidle' });
   await wait(page);
   await shot(page, '01-home.png');

   // 2. Плеер играет
   await page.locator('button[aria-label="Играть"]').first().click({ force: true });
   await wait(page);
   await shot(page, '02-player.png');

   // 3. Полноэкранный плеер (кнопка «На весь экран»)
   await page.locator('button[aria-label="На весь экран"]').click({ force: true }).catch(() => {});
   await wait(page);
   await shot(page, '03-fullscreen.png');
   await page.locator('button[aria-label="Свернуть"]').click().catch(() => {});
   await wait(page, 600);

   // 4. Страница трека
   await page.goto(`${BASE}/track/${track._id}`, { waitUntil: 'networkidle' });
   await wait(page);
   await shot(page, '04-track.png');

   // 5. Страница артиста
   await page.goto(`${BASE}/artist/${artistId}`, { waitUntil: 'networkidle' });
   await wait(page);
   await shot(page, '05-artist.png');

   // 6. Поиск с фильтрами
   await page.goto(`${BASE}/search?q=a`, { waitUntil: 'networkidle' });
   await wait(page);
   await shot(page, '06-search.png');

   // 7. Библиотека (логин обычным юзером)
   await login('demo@demo.dev', 'demo1234');
   await page.goto(`${BASE}/library`, { waitUntil: 'networkidle' });
   await wait(page);
   await shot(page, '07-library.png');

   // 8. Админ-панель на треке (перелогин админом)
   await page.locator('button[aria-label="Выйти"]').click().catch(() => {});
   await wait(page, 800);
   await login('admin@demo.dev', 'admin1234');
   await page.goto(`${BASE}/track/${track._id}`, { waitUntil: 'networkidle' });
   await wait(page);
   await page.click('text=Редактировать', { timeout: 5000 }).catch(() => {});
   await wait(page, 800);
   await shot(page, '08-admin.png');

   console.log('✓ Скриншоты сохранены в', outDir);
   console.log(fs.readdirSync(outDir).join(', '));
} catch (e) {
   console.error('Ошибка:', e);
   process.exitCode = 1;
} finally {
   await browser.close();
}
