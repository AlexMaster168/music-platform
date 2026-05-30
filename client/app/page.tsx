'use client';

import Link from 'next/link';
import { useHome } from '@/hooks/queries';
import { usePlayer } from '@/hooks/usePlayer';
import { Section } from '@/components/common/Section';
import { MediaCard } from '@/components/media/MediaCard';
import { artistName, type ITrack, type IAlbum } from '@/types';
import { languageName } from '@/lib/utils';

function trackCards(tracks: ITrack[] | undefined, playOne: (t: ITrack) => void) {
   return (tracks ?? []).map((t) => (
      <MediaCard
         key={t._id}
         title={t.name}
         subtitle={artistName(t)}
         cover={t.picture}
         href={`/track/${t._id}`}
         onPlay={() => playOne(t)}
      />
   ));
}

export default function HomePage() {
   const { data, isLoading } = useHome();
   const { playOne } = usePlayer();

   if (isLoading) {
      return <p className="text-[var(--color-muted)]">Загрузка...</p>;
   }

   const empty =
      !data ||
      (!data.trending.length &&
         !data.fresh.length &&
         !data.covers.length &&
         !data.albums.length);

   if (empty) {
      return (
         <div className="flex flex-col items-center justify-center py-24 text-center">
            <h1 className="text-2xl font-bold">Пока пусто 🎵</h1>
            <p className="mt-2 text-[var(--color-muted)]">
               Загрузи первый трек, чтобы здесь появились подборки.
            </p>
            <Link
               href="/upload"
               className="mt-4 rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-medium"
            >
               Загрузить трек
            </Link>
         </div>
      );
   }

   return (
      <div>
         <h1 className="mb-6 text-2xl font-bold">Добро пожаловать 👋</h1>

         {data.languages.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
               {data.languages.map((lang) => (
                  <Link
                     key={lang}
                     href={`/search?language=${lang}`}
                     className="rounded-full bg-[var(--color-surface)] px-4 py-1.5 text-sm hover:bg-[var(--color-surface-hover)]"
                  >
                     {languageName(lang)}
                  </Link>
               ))}
            </div>
         )}

         {data.history.length > 0 && (
            <Section title="Слушали недавно">
               {trackCards(data.history, playOne)}
            </Section>
         )}

         {data.trending.length > 0 && (
            <Section title="Сейчас популярно">
               {trackCards(data.trending, playOne)}
            </Section>
         )}

         {data.covers.length > 0 && (
            <Section title="Каверы на разных языках">
               {trackCards(data.covers, playOne)}
            </Section>
         )}

         {data.fresh.length > 0 && (
            <Section title="Новинки">{trackCards(data.fresh, playOne)}</Section>
         )}

         {data.albums.length > 0 && (
            <Section title="Свежие альбомы">
               {data.albums.map((a: IAlbum) => (
                  <MediaCard
                     key={a._id}
                     title={a.title}
                     subtitle={artistName(a)}
                     cover={a.cover}
                     href={`/album/${a._id}`}
                  />
               ))}
            </Section>
         )}
      </div>
   );
}
