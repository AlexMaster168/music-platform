// Смоук-тест backend на in-memory MongoDB. Запуск: node scripts/smoke.mjs
import { MongoMemoryServer } from 'mongodb-memory-server';

const PORT = 5050;
const BASE = `http://localhost:${PORT}/api`;

let passed = 0;
let failed = 0;
function check(name, cond, extra = '') {
   if (cond) {
      passed++;
      console.log(`  ✓ ${name}`);
   } else {
      failed++;
      console.log(`  ✗ ${name} ${extra}`);
   }
}

async function main() {
   console.log('→ Поднимаю in-memory MongoDB...');
   const mongod = await MongoMemoryServer.create();
   process.env.MONGO_URI = mongod.getUri();
   process.env.JWT_ACCESS_SECRET ||= 'test_access';
   process.env.JWT_REFRESH_SECRET ||= 'test_refresh';
   process.env.PORT = String(PORT);

   const { NestFactory } = await import('@nestjs/core');
   const { ValidationPipe } = await import('@nestjs/common');
   const { AppModule } = await import('../dist/app.module.js');

   const app = await NestFactory.create(AppModule, { logger: false });
   app.setGlobalPrefix('api');
   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         transform: true,
         transformOptions: { enableImplicitConversion: true },
      }),
   );
   await app.listen(PORT);
   console.log(`→ Сервер на ${BASE}\n`);

   const json = (r) => r.json();
   let token, trackId, playlistId, artistId;

   try {
      // 1. Регистрация
      const reg = await fetch(`${BASE}/auth/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            email: 'leha@test.dev',
            password: 'secret123',
            displayName: 'Лёха',
         }),
      });
      const regData = await json(reg);
      console.log('AUTH');
      check('register → 201', reg.status === 201, `(got ${reg.status})`);
      check('register отдал accessToken', !!regData.accessToken);
      check('пароль НЕ утёк в ответе', !regData.user?.passwordHash);
      token = regData.accessToken;

      // 2. Дубль email → 409
      const dup = await fetch(`${BASE}/auth/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            email: 'leha@test.dev',
            password: 'secret123',
            displayName: 'Лёха2',
         }),
      });
      check('повторный email → 409', dup.status === 409, `(got ${dup.status})`);

      // 3. Логин
      const login = await fetch(`${BASE}/auth/login`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: 'leha@test.dev', password: 'secret123' }),
      });
      check('login → 201', login.status === 201, `(got ${login.status})`);

      // 4. Неверный пароль → 401
      const bad = await fetch(`${BASE}/auth/login`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: 'leha@test.dev', password: 'wrong' }),
      });
      check('неверный пароль → 401', bad.status === 401, `(got ${bad.status})`);

      // 5. /me с токеном
      const me = await fetch(`${BASE}/auth/me`, {
         headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await json(me);
      check('/auth/me → 200', me.status === 200, `(got ${me.status})`);
      check('/auth/me вернул правильный email', meData.email === 'leha@test.dev');

      // 6. /me без токена → 401
      const meNoAuth = await fetch(`${BASE}/auth/me`);
      check('/auth/me без токена → 401', meNoAuth.status === 401, `(got ${meNoAuth.status})`);

      // 7. Загрузка трека (multipart, авто-создание артиста и альбома)
      console.log('\nTRACKS');
      const fd = new FormData();
      fd.append('name', 'Believer');
      fd.append('artist', 'Imagine Dragons');
      fd.append('album', 'Evolve');
      fd.append('language', 'en');
      fd.append('genres', 'rock,pop');
      fd.append('audio', new Blob([Buffer.from([1, 2, 3, 4])], { type: 'audio/mpeg' }), 'b.mp3');
      fd.append('picture', new Blob([Buffer.from([5, 6, 7, 8])], { type: 'image/png' }), 'b.png');
      const up = await fetch(`${BASE}/tracks`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${token}` },
         body: fd,
      });
      const upData = await json(up);
      check('upload трека → 201', up.status === 201, `(got ${up.status}) ${JSON.stringify(upData).slice(0, 120)}`);
      check('у трека есть audio-путь', !!upData.audio);
      check('артист авто-создан и привязан', !!upData.artistId?.name, `(${upData.artistId?.name})`);
      trackId = upData._id;
      artistId = upData.artistId?._id;

      // 8. Загрузка без токена → 401
      const upNoAuth = await fetch(`${BASE}/tracks`, { method: 'POST', body: new FormData() });
      check('upload без токена → 401', upNoAuth.status === 401, `(got ${upNoAuth.status})`);

      // 9. Список треков
      const all = await fetch(`${BASE}/tracks`).then(json);
      check('GET /tracks → массив с треком', Array.isArray(all) && all.length >= 1, `(len ${all.length})`);

      // 10. Один трек + isLiked
      const one = await fetch(`${BASE}/tracks/${trackId}`).then(json);
      check('GET /tracks/:id → isLiked=false', one.isLiked === false);

      // 11. Фильтр по языку
      const byLang = await fetch(`${BASE}/tracks?language=en`).then(json);
      check('фильтр ?language=en работает', Array.isArray(byLang) && byLang.length >= 1, `(len ${byLang.length})`);

      // 12. Лайк
      console.log('\nLIKES / LIBRARY');
      const like = await fetch(`${BASE}/users/me/likes/${trackId}`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${token}` },
      });
      check('лайк → 201', like.status === 201, `(got ${like.status})`);
      const likes = await fetch(`${BASE}/users/me/likes`, {
         headers: { Authorization: `Bearer ${token}` },
      }).then(json);
      check('liked-треки содержат трек', likes.length === 1, `(len ${likes.length})`);
      const oneLiked = await fetch(`${BASE}/tracks/${trackId}`, {
         headers: { Authorization: `Bearer ${token}` },
      }).then(json);
      check('GET /tracks/:id с токеном → isLiked=true', oneLiked.isLiked === true);

      // 13. Подписка на артиста
      const follow = await fetch(`${BASE}/users/me/following/${artistId}`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${token}` },
      });
      check('подписка на артиста → 201', follow.status === 201, `(got ${follow.status})`);
      const artist = await fetch(`${BASE}/artists/${artistId}`).then(json);
      check('страница артиста: followersCount=1', artist.artist?.followersCount === 1, `(${artist.artist?.followersCount})`);
      check('страница артиста: есть треки', artist.tracks?.length >= 1);

      // 14. Плейлисты
      console.log('\nPLAYLISTS');
      const pl = await fetch(`${BASE}/playlists`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
         body: JSON.stringify({ title: 'Мой плейлист' }),
      }).then(json);
      playlistId = pl._id;
      check('создание плейлиста', !!playlistId);
      await fetch(`${BASE}/playlists/${playlistId}/tracks/${trackId}`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${token}` },
      });
      const plFull = await fetch(`${BASE}/playlists/${playlistId}`).then(json);
      check('трек добавлен в плейлист', plFull.tracks?.length === 1, `(len ${plFull.tracks?.length})`);

      // 15. Прослушивание
      console.log('\nLISTEN / HOME / SEARCH');
      await fetch(`${BASE}/tracks/listen/${trackId}`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${token}` },
      });
      const afterListen = await fetch(`${BASE}/tracks/${trackId}`).then(json);
      check('счётчик прослушиваний +1', afterListen.listens === 1, `(${afterListen.listens})`);

      // 16. Home feed
      const home = await fetch(`${BASE}/home`, {
         headers: { Authorization: `Bearer ${token}` },
      }).then(json);
      check('home: есть trending', Array.isArray(home.trending) && home.trending.length >= 1);
      check('home: languages содержит en', home.languages?.includes('en'));
      check('home: история прослушиваний не пуста', home.history?.length >= 1);

      // 17. Поиск
      const search = await fetch(`${BASE}/search?q=Believer`).then(json);
      check('поиск находит трек', search.tracks?.length >= 1, `(len ${search.tracks?.length})`);
      const searchArtist = await fetch(`${BASE}/search?q=Imagine&type=artists`).then(json);
      check('поиск по артистам работает', searchArtist.artists?.length >= 1);

      // 18. Похожие
      const similar = await fetch(`${BASE}/tracks/${trackId}/similar`).then(json);
      check('similar → массив', Array.isArray(similar));

      // 19. Удаление трека
      const del = await fetch(`${BASE}/tracks/${trackId}`, {
         method: 'DELETE',
         headers: { Authorization: `Bearer ${token}` },
      });
      check('удаление трека → 200', del.status === 200, `(got ${del.status})`);
      const gone = await fetch(`${BASE}/tracks/${trackId}`);
      check('удалённый трек → 404', gone.status === 404, `(got ${gone.status})`);
   } catch (e) {
      console.error('ОШИБКА в сценарии:', e);
      failed++;
   } finally {
      await app.close();
      await mongod.stop();
   }

   console.log(`\n==== ИТОГ: ${passed} passed, ${failed} failed ====`);
   process.exit(failed === 0 ? 0 : 1);
}

main();
