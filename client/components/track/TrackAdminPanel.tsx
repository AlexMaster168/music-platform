'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDeleteTrack, useUpdateTrack } from '@/hooks/queries';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { artistOf, type ITrack } from '@/types';

const LANGUAGES = ['', 'ru', 'en', 'es', 'fr', 'de', 'ja', 'ko', 'uk', 'tr'];

export function TrackAdminPanel({ track }: { track: ITrack }) {
   const { user } = useAuth();
   const router = useRouter();
   const update = useUpdateTrack();
   const del = useDeleteTrack();
   const [open, setOpen] = useState(false);

   const album =
      track.albumId && typeof track.albumId !== 'string' ? track.albumId : null;
   const [form, setForm] = useState({
      name: track.name,
      artist: artistOf(track)?.name ?? '',
      album: album?.title ?? '',
      genres: (track.genres ?? []).join(', '),
      language: track.language ?? '',
      lyrics: track.lyrics ?? '',
      isCover: !!track.isCover,
   });

   if (user?.role !== 'admin') return null;

   const set = (k: keyof typeof form, v: string | boolean) =>
      setForm((f) => ({ ...f, [k]: v }));

   const save = async () => {
      await update.mutateAsync({
         id: track._id,
         body: {
            name: form.name,
            artist: form.artist || undefined,
            album: form.album, // '' — убрать из альбома
            genres: form.genres
               .split(',')
               .map((s) => s.trim())
               .filter(Boolean),
            language: form.language || undefined,
            lyrics: form.lyrics,
            isCover: form.isCover,
         },
      });
      toast.success('Трек обновлён');
      setOpen(false);
   };

   const remove = async () => {
      await del.mutateAsync(track._id);
      toast.success('Трек удалён');
      router.push('/');
   };

   return (
      <div className="mt-5 rounded-xl border border-[var(--color-line)] p-4">
         <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-brand)]">
               Админ
            </span>
            <div className="flex gap-2">
               <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
                  <Pencil className="h-4 w-4" /> Редактировать
               </Button>
               <Button size="sm" variant="outline" onClick={remove}>
                  <Trash2 className="h-4 w-4" /> Удалить
               </Button>
            </div>
         </div>

         {open && (
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
               <Input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Название"
               />
               <Input
                  value={form.artist}
                  onChange={(e) => set('artist', e.target.value)}
                  placeholder="Исполнитель"
               />
               <Input
                  value={form.album}
                  onChange={(e) => set('album', e.target.value)}
                  placeholder="Альбом (пусто — убрать)"
               />
               <Input
                  value={form.genres}
                  onChange={(e) => set('genres', e.target.value)}
                  placeholder="Жанры через запятую"
               />
               <select
                  value={form.language}
                  onChange={(e) => set('language', e.target.value)}
                  className="h-11 rounded-lg bg-[var(--color-surface)] px-3 text-sm outline-none"
               >
                  {LANGUAGES.map((l) => (
                     <option key={l} value={l}>
                        {l || '— язык —'}
                     </option>
                  ))}
               </select>
               <label className="flex items-center gap-2 text-sm">
                  <input
                     type="checkbox"
                     checked={form.isCover}
                     onChange={(e) => set('isCover', e.target.checked)}
                     className="accent-[var(--color-brand)]"
                  />
                  Кавер
               </label>
               <textarea
                  value={form.lyrics}
                  onChange={(e) => set('lyrics', e.target.value)}
                  placeholder="Текст"
                  rows={3}
                  className="rounded-lg bg-[var(--color-surface)] p-3 text-sm outline-none sm:col-span-2"
               />
               <Button
                  variant="primary"
                  onClick={save}
                  disabled={update.isPending}
                  className="sm:col-span-2"
               >
                  {update.isPending ? 'Сохранение...' : 'Сохранить'}
               </Button>
            </div>
         )}
      </div>
   );
}
