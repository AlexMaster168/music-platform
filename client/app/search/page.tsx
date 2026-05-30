'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useHome, useSearch, useTracks } from '@/hooks/queries';
import { MediaCard } from '@/components/media/MediaCard';
import { TrackList } from '@/components/track/TrackList';
import { artistName } from '@/types';
import { cn, languageName } from '@/lib/utils';

const TYPES = [
   { key: 'all', label: 'Всё' },
   { key: 'tracks', label: 'Треки' },
   { key: 'artists', label: 'Артисты' },
   { key: 'albums', label: 'Альбомы' },
   { key: 'playlists', label: 'Плейлисты' },
];

function SearchInner() {
   const params = useSearchParams();
   const q = params.get('q') ?? '';
   const [type, setType] = useState('all');
   const [language, setLanguage] = useState(params.get('language') ?? '');
   const [genre, setGenre] = useState(params.get('genre') ?? '');

   const { data: home } = useHome();
   const search = useSearch(q, type, language || undefined, genre || undefined);
   const browseActive = !q && (!!language || !!genre);
   const browse = useTracks(
      browseActive
         ? { language: language || undefined, genre: genre || undefined }
         : {},
   );

   const Filters = (
      <div className="mb-6 flex flex-wrap gap-3">
         <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-10 rounded-full bg-[var(--color-surface)] px-4 text-sm outline-none"
         >
            <option value="">Все языки</option>
            {(home?.languages ?? []).map((l) => (
               <option key={l} value={l}>
                  {languageName(l)}
               </option>
            ))}
         </select>
         <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="h-10 rounded-full bg-[var(--color-surface)] px-4 text-sm outline-none"
         >
            <option value="">Все жанры</option>
            {(home?.genres ?? []).map((g) => (
               <option key={g} value={g}>
                  {g}
               </option>
            ))}
         </select>
      </div>
   );

   // Браузинг по жанру/языку без поискового запроса
   if (browseActive) {
      return (
         <div>
            <h1 className="mb-4 text-2xl font-bold">
               {genre ? `Жанр: ${genre}` : ''}
               {genre && language ? ' · ' : ''}
               {language ? languageName(language) : ''}
            </h1>
            {Filters}
            <TrackList tracks={browse.data ?? []} />
         </div>
      );
   }

   if (!q) {
      return (
         <div>
            <h1 className="mb-4 text-2xl font-bold">Поиск</h1>
            {Filters}
            <p className="text-[var(--color-muted)]">
               Введи запрос сверху или выбери жанр/язык, чтобы листать треки.
            </p>
         </div>
      );
   }

   const data = search.data;
   const showTracks = type === 'all' || type === 'tracks';
   const showArtists = type === 'all' || type === 'artists';
   const showAlbums = type === 'all' || type === 'albums';
   const showPlaylists = type === 'all' || type === 'playlists';

   return (
      <div>
         <h1 className="mb-4 text-2xl font-bold">Результаты: «{q}»</h1>
         {Filters}

         <div className="mb-6 flex gap-2 overflow-x-auto">
            {TYPES.map((t) => (
               <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={cn(
                     'rounded-full px-4 py-1.5 text-sm whitespace-nowrap',
                     type === t.key
                        ? 'bg-white text-black'
                        : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]',
                  )}
               >
                  {t.label}
               </button>
            ))}
         </div>

         {search.isLoading && <p className="text-[var(--color-muted)]">Ищем...</p>}

         {showArtists && data?.artists && data.artists.length > 0 && (
            <section className="mb-8">
               <h2 className="mb-3 text-xl font-bold">Артисты</h2>
               <div className="flex gap-4 overflow-x-auto pb-2">
                  {data.artists.map((a) => (
                     <MediaCard
                        key={a._id}
                        title={a.name}
                        cover={a.avatar}
                        href={`/artist/${a._id}`}
                        rounded
                     />
                  ))}
               </div>
            </section>
         )}

         {showAlbums && data?.albums && data.albums.length > 0 && (
            <section className="mb-8">
               <h2 className="mb-3 text-xl font-bold">Альбомы</h2>
               <div className="flex gap-4 overflow-x-auto pb-2">
                  {data.albums.map((a) => (
                     <MediaCard
                        key={a._id}
                        title={a.title}
                        subtitle={artistName(a)}
                        cover={a.cover}
                        href={`/album/${a._id}`}
                     />
                  ))}
               </div>
            </section>
         )}

         {showPlaylists && data?.playlists && data.playlists.length > 0 && (
            <section className="mb-8">
               <h2 className="mb-3 text-xl font-bold">Плейлисты</h2>
               <div className="flex gap-4 overflow-x-auto pb-2">
                  {data.playlists.map((p) => (
                     <MediaCard key={p._id} title={p.title} href={`/playlist/${p._id}`} />
                  ))}
               </div>
            </section>
         )}

         {showTracks && data?.tracks && data.tracks.length > 0 && (
            <section className="mb-8">
               <h2 className="mb-3 text-xl font-bold">Треки</h2>
               <TrackList tracks={data.tracks} />
            </section>
         )}

         {data &&
            !data.tracks.length &&
            !data.artists.length &&
            !data.albums.length &&
            !data.playlists.length && (
               <p className="text-[var(--color-muted)]">Ничего не найдено</p>
            )}
      </div>
   );
}

export default function SearchPage() {
   return (
      <Suspense fallback={<p className="text-[var(--color-muted)]">Загрузка...</p>}>
         <SearchInner />
      </Suspense>
   );
}
