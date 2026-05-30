// Playwright-проверка фронтенда против живого API.
// Playwright резолвится из глобального node_modules (env GLOBAL_NM).
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const groot = process.env.GLOBAL_NM;
const pw = await import(pathToFileURL(path.join(groot, 'playwright', 'index.js')).href);
const chromium = pw.chromium ?? pw.default.chromium;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shotsDir = path.resolve(__dirname, 'shots');
fs.mkdirSync(shotsDir, { recursive: true });

const BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;
const errors = [];
function check(name, cond, extra = '') {
   if (cond) {
      passed++;
      console.log(`  ✓ ${name}`);
   } else {
      failed++;
      console.log(`  ✗ ${name} ${extra}`);
   }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const consoleErrors = [];
page.on('console', (m) => {
   if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => errors.push(String(e)));

try {
   // 1. Главная с подборками
   await page.goto(BASE, { waitUntil: 'networkidle' });
   await page.waitForTimeout(1500);
   const homeText = await page.textContent('body');
   check('Главная: заголовок "Сейчас популярно"', homeText.includes('Сейчас популярно'));
   check('Главная: показан трек Midnight City', homeText.includes('Midnight City'));
   check('Главная: секция каверов', homeText.includes('Каверы на разных языках'));
   check('Главная: чип языка (Русский)', homeText.includes('Русский'));
   await page.screenshot({ path: path.join(shotsDir, '1-home.png') });

   // 2. Запуск воспроизведения по карточке → появляется плеер-бар
   const playBtn = page.locator('button[aria-label="Играть"]').first();
   await playBtn.click({ force: true });
   await page.waitForTimeout(1200);
   const afterPlay = await page.textContent('body');
   // в плеер-баре снизу должно появиться имя трека и кнопка паузы
   check('Плеер: появилась кнопка "Пауза"', (await page.locator('button[aria-label="Пауза"]').count()) > 0);
   await page.screenshot({ path: path.join(shotsDir, '2-playing.png') });

   // 3. Поиск
   await page.goto(`${BASE}/search?q=Midnight`, { waitUntil: 'networkidle' });
   await page.waitForTimeout(1200);
   const searchText = await page.textContent('body');
   check('Поиск: нашёл "Midnight City"', searchText.includes('Midnight City'));
   await page.screenshot({ path: path.join(shotsDir, '3-search.png') });

   // 4. Логин демо-пользователем
   await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
   await page.fill('input[type="email"]', 'demo@demo.dev');
   await page.fill('input[type="password"]', 'demo1234');
   await page.click('button[type="submit"]');
   await page.waitForTimeout(1800);
   const afterLogin = await page.textContent('body');
   check('Логин: имя пользователя "Лёха" в шапке', afterLogin.includes('Лёха'));
   await page.screenshot({ path: path.join(shotsDir, '4-after-login.png') });

   // 5. Библиотека (требует авторизации)
   await page.goto(`${BASE}/library`, { waitUntil: 'networkidle' });
   await page.waitForTimeout(1500);
   const libText = await page.textContent('body');
   check('Библиотека: заголовок "Моя библиотека"', libText.includes('Моя библиотека'));
   check('Библиотека: любимый трек подтянулся', libText.includes('Midnight City') || libText.includes('Corazón'));
   await page.screenshot({ path: path.join(shotsDir, '5-library.png') });

   // 6. Страница артиста
   await page.goto(BASE, { waitUntil: 'networkidle' });
   await page.waitForTimeout(800);
   await page.click('text=Aurora Lights', { timeout: 5000 }).catch(() => {});
   await page.waitForTimeout(1200);
   await page.screenshot({ path: path.join(shotsDir, '6-artist.png') });
} catch (e) {
   console.error('Сценарий упал:', e);
   failed++;
} finally {
   await browser.close();
}

check('Нет pageerror (необработанных исключений)', errors.length === 0, errors.join(' | '));
// фильтруем шумные сетевые ошибки favicon/изображений
const severe = consoleErrors.filter(
   (e) => !/favicon|404|Failed to load resource/i.test(e),
);
check('Нет критичных console.error', severe.length === 0, severe.slice(0, 3).join(' | '));

console.log(`\n==== UI ИТОГ: ${passed} passed, ${failed} failed ====`);
console.log('Скриншоты:', shotsDir);
process.exit(failed === 0 ? 0 : 1);
