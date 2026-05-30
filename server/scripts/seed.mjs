// Заполнение БД демо-данными (royalty-free аудио + картинки). Запуск: node scripts/seed.mjs
import dns from 'dns';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Опционально форсим публичный DNS в урезанных сетях: DNS_SERVERS=8.8.8.8,1.1.1.1
if (process.env.DNS_SERVERS) {
   dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
   console.error('✗ Нет MONGO_URI в окружении (.env)');
   process.exit(1);
}

const staticRoot = path.resolve(__dirname, '..', 'dist', 'static');

/** Скачивает url в dist/static/<relPath>, возвращает relPath. */
async function download(url, relPath) {
   const dest = path.resolve(staticRoot, relPath);
   fs.mkdirSync(path.dirname(dest), { recursive: true });
   const res = await fetch(url);
   if (!res.ok) throw new Error(`${url} → ${res.status}`);
   fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
   return relPath;
}

const song = (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;
const pic = (seed, w = 500, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

console.log('→ Скачиваю royalty-free аудио и картинки...');
const [
   aAurora, aDozor, aLuna, aSakura, // аватарки артистов
   bAurora, bDozor, // баннеры
   cNeon, cGroza, cSol, // обложки альбомов
   pHanabi, pCover, // картинки одиночных треков
   s1, s2, s3, s4, s5, s6, s7, // аудио
] = await Promise.all([
   download(pic('aurora'), 'image/artist-aurora.jpg'),
   download(pic('dozor'), 'image/artist-dozor.jpg'),
   download(pic('luna'), 'image/artist-luna.jpg'),
   download(pic('sakura'), 'image/artist-sakura.jpg'),
   download(pic('aurora-banner', 1200, 400), 'image/banner-aurora.jpg'),
   download(pic('dozor-banner', 1200, 400), 'image/banner-dozor.jpg'),
   download(pic('neon'), 'image/album-neon.jpg'),
   download(pic('groza'), 'image/album-groza.jpg'),
   download(pic('sol'), 'image/album-sol.jpg'),
   download(pic('hanabi'), 'image/track-hanabi.jpg'),
   download(pic('cover'), 'image/track-cover.jpg'),
   download(song(1), 'audio/song-1.mp3'),
   download(song(2), 'audio/song-2.mp3'),
   download(song(3), 'audio/song-3.mp3'),
   download(song(5), 'audio/song-5.mp3'),
   download(song(6), 'audio/song-6.mp3'),
   download(song(8), 'audio/song-8.mp3'),
   download(song(9), 'audio/song-9.mp3'),
]);
console.log('  готово (7 треков + 11 изображений)');

await mongoose.connect(MONGO_URI);
const db = mongoose.connection.db;
const oid = () => new mongoose.Types.ObjectId();
const now = new Date();
const ts = { createdAt: now, updatedAt: now };

console.log('→ Чищу коллекции (drop — вместе со старыми индексами)...');
for (const c of [
   'users',
   'artists',
   'albums',
   'tracks',
   'playlists',
   'comments',
   'listenhistories',
]) {
   try {
      await db.collection(c).drop();
   } catch {
      /* коллекции может не быть — это ок */
   }
}

// ===== Артисты (4 языка) =====
const A = { aurora: oid(), dozor: oid(), luna: oid(), sakura: oid() };
await db.collection('artists').insertMany([
   { _id: A.aurora, name: 'Aurora Lights', bio: 'Synth-pop из Лондона', avatar: aAurora, banner: bAurora, genres: ['pop', 'electronic'], languages: ['en'], followersCount: 0, ...ts },
   { _id: A.dozor, name: 'Ночной Дозор', bio: 'Русский рок', avatar: aDozor, banner: bDozor, genres: ['rock'], languages: ['ru'], followersCount: 0, ...ts },
   { _id: A.luna, name: 'Luna Sol', bio: 'Latin pop', avatar: aLuna, genres: ['latin', 'pop'], languages: ['es'], followersCount: 0, ...ts },
   { _id: A.sakura, name: '桜 Sakura', bio: 'J-pop', avatar: aSakura, genres: ['jpop'], languages: ['ja'], followersCount: 0, ...ts },
]);

// ===== Альбомы =====
const AL = { neon: oid(), groza: oid(), sol: oid() };
await db.collection('albums').insertMany([
   { _id: AL.neon, title: 'Neon Dreams', artistId: A.aurora, cover: cNeon, type: 'album', language: 'en', genres: ['pop'], releaseDate: now, ...ts },
   { _id: AL.groza, title: 'Гроза', artistId: A.dozor, cover: cGroza, type: 'album', language: 'ru', genres: ['rock'], releaseDate: now, ...ts },
   { _id: AL.sol, title: 'Sol', artistId: A.luna, cover: cSol, type: 'single', language: 'es', genres: ['latin'], releaseDate: now, ...ts },
]);

// ===== Треки (каждый — свой mp3; картинка = обложка альбома или своя) =====
const T = {
   midnight: oid(), electric: oid(), groza: oid(), veter: oid(),
   corazon: oid(), hanabi: oid(), midnightRuCover: oid(),
};
await db.collection('tracks').insertMany([
   { _id: T.midnight, name: 'Midnight City', artistId: A.aurora, albumId: AL.neon, audio: s1, picture: cNeon, duration: 0, listens: 540, genres: ['pop', 'electronic'], language: 'en', isCover: false, comments: [], ...ts },
   { _id: T.electric, name: 'Electric Heart', artistId: A.aurora, albumId: AL.neon, audio: s2, picture: cNeon, duration: 0, listens: 320, genres: ['pop'], language: 'en', isCover: false, comments: [], ...ts },
   { _id: T.groza, name: 'Гроза', artistId: A.dozor, albumId: AL.groza, audio: s3, picture: cGroza, duration: 0, listens: 410, genres: ['rock'], language: 'ru', isCover: false, comments: [], ...ts },
   { _id: T.veter, name: 'Ветер', artistId: A.dozor, albumId: AL.groza, audio: s4, picture: cGroza, duration: 0, listens: 150, genres: ['rock'], language: 'ru', isCover: false, comments: [], ...ts },
   { _id: T.corazon, name: 'Corazón', artistId: A.luna, albumId: AL.sol, audio: s5, picture: cSol, duration: 0, listens: 280, genres: ['latin', 'pop'], language: 'es', isCover: false, comments: [], ...ts },
   { _id: T.hanabi, name: '花火 (Hanabi)', artistId: A.sakura, audio: s6, picture: pHanabi, duration: 0, listens: 200, genres: ['jpop'], language: 'ja', isCover: false, comments: [], ...ts },
   { _id: T.midnightRuCover, name: 'Полночный город', artistId: A.dozor, audio: s7, picture: pCover, duration: 0, listens: 95, genres: ['rock'], language: 'ru', isCover: true, originalTrackId: T.midnight, comments: [], ...ts },
]);

// ===== Пользователи (обычный + админ) =====
const userId = oid();
await db.collection('users').insertMany([
   {
      _id: userId,
      email: 'demo@demo.dev',
      passwordHash: await bcrypt.hash('demo1234', 10),
      displayName: 'Лёха',
      role: 'user',
      likedTracks: [T.midnight, T.corazon],
      followingArtists: [A.aurora],
      ...ts,
   },
   {
      _id: oid(),
      email: 'admin@demo.dev',
      passwordHash: await bcrypt.hash('admin1234', 10),
      displayName: 'Админ',
      role: 'admin',
      likedTracks: [],
      followingArtists: [],
      ...ts,
   },
]);

// ===== Плейлист =====
await db.collection('playlists').insertOne({
   _id: oid(),
   title: 'Мультиязычная солянка',
   description: 'Треки на разных языках + кавер',
   ownerId: userId,
   tracks: [T.midnight, T.groza, T.corazon, T.hanabi, T.midnightRuCover],
   isPublic: true,
   ...ts,
});

console.log('✓ Демо-данные созданы:');
console.log('  4 артиста, 3 альбома, 7 треков (вкл. 1 кавер), 1 плейлист');
console.log('  Аудио: SoundHelix (royalty-free) · Картинки: Picsum');
console.log('  Юзер:  demo@demo.dev / demo1234');
console.log('  Админ: admin@demo.dev / admin1234');

await mongoose.disconnect();
process.exit(0);
