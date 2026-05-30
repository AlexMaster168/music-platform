'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Play } from 'lucide-react';
import { useAlbum } from '@/hooks/queries';
import { usePlayer } from '@/hooks/usePlayer';
import { Cover } from '@/components/common/Cover';
import { Button } from '@/components/ui/button';
import { TrackList } from '@/components/track/TrackList';
import { artistName, artistOf } from '@/types';
import { languageName } from '@/lib/utils';

export default function AlbumPage() {
   const { id } = useParams<{ id: string }>();
   const { data, isLoading } = useAlbum(id);
   const { playList } = usePlayer();

   if (isLoading) return <p className="text-[var(--color-muted)]">Загрузка...</p>;
   if (!data) return <p>Альбом не найден</p>;

   const { album, tracks } = data;
   const artist = artistOf(album);

   return (
      <div className="max-w-4xl">
         <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <Cover
               src={album.cover}
               alt={album.title}
               className="h-48 w-48 shadow-2xl"
            />
            <div className="flex-1">
               <span className="text-xs uppercase text-[var(--color-muted)]">
                  {album.type ?? 'album'}
               </span>
               <h1 className="text-3xl font-bold">{album.title}</h1>
               <p className="mt-1 text-[var(--color-muted)]">
                  {artist ? (
                     <Link href={`/artist/${artist._id}`} className="hover:underline">
                        {artist.name}
                     </Link>
                  ) : (
                     artistName(album)
                  )}
                  {album.language && <> · {languageName(album.language)}</>} ·{' '}
                  {tracks.length} треков
               </p>
               <div className="mt-4">
                  <Button
                     variant="primary"
                     onClick={() => playList(tracks)}
                     disabled={!tracks.length}
                  >
                     <Play className="h-4 w-4 fill-white" /> Слушать
                  </Button>
               </div>
            </div>
         </div>

         <section className="mt-8">
            <TrackList tracks={tracks} />
         </section>
      </div>
   );
}
