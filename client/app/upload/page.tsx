'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUploadTrack } from '@/hooks/queries';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const LANGUAGES = [
   ['', '— язык —'],
   ['ru', 'Русский'],
   ['en', 'English'],
   ['es', 'Español'],
   ['fr', 'Français'],
   ['de', 'Deutsch'],
   ['ja', '日本語'],
   ['ko', '한국어'],
   ['uk', 'Українська'],
   ['tr', 'Türkçe'],
];

/** Читает длительность аудиофайла в секундах через временный Audio. */
function readDuration(file: File): Promise<number> {
   return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
         URL.revokeObjectURL(url);
         resolve(Math.round(audio.duration) || 0);
      });
      audio.addEventListener('error', () => {
         URL.revokeObjectURL(url);
         resolve(0);
      });
   });
}

export default function UploadPage() {
   const { isAuthed } = useAuth();
   const router = useRouter();
   const upload = useUploadTrack();

   const [form, setForm] = useState({
      name: '',
      artist: '',
      album: '',
      language: '',
      genres: '',
      lyrics: '',
      isCover: false,
      originalTrackId: '',
   });
   const [audio, setAudio] = useState<File | null>(null);
   const [picture, setPicture] = useState<File | null>(null);
   const [submitting, setSubmitting] = useState(false);

   if (!isAuthed) {
      return (
         <div className="flex flex-col items-center justify-center py-24 text-center">
            <h1 className="text-2xl font-bold">Загрузка трека</h1>
            <p className="mt-2 text-[var(--color-muted)]">
               Войди, чтобы загружать музыку.
            </p>
            <Link
               href="/login"
               className="mt-4 rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-medium"
            >
               Войти
            </Link>
         </div>
      );
   }

   const set = (key: keyof typeof form, value: string | boolean) =>
      setForm((f) => ({ ...f, [key]: value }));

   const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!audio) return toast.error('Прикрепи аудиофайл');
      setSubmitting(true);
      try {
         const duration = await readDuration(audio);
         const fd = new FormData();
         fd.append('name', form.name);
         fd.append('artist', form.artist);
         if (form.album) fd.append('album', form.album);
         if (form.language) fd.append('language', form.language);
         if (form.genres) fd.append('genres', form.genres);
         if (form.lyrics) fd.append('lyrics', form.lyrics);
         fd.append('isCover', String(form.isCover));
         if (form.isCover && form.originalTrackId)
            fd.append('originalTrackId', form.originalTrackId);
         fd.append('duration', String(duration));
         fd.append('audio', audio);
         if (picture) fd.append('picture', picture);

         const track = await upload.mutateAsync(fd);
         toast.success('Трек загружен!');
         router.push(`/track/${track._id}`);
      } catch (err) {
         toast.error((err as Error)?.message || 'Ошибка загрузки');
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="max-w-xl">
         <h1 className="mb-6 text-2xl font-bold">Загрузить трек</h1>
         <form onSubmit={submit} className="flex flex-col gap-3">
            <Input
               placeholder="Название трека *"
               value={form.name}
               onChange={(e) => set('name', e.target.value)}
               required
            />
            <Input
               placeholder="Артист *"
               value={form.artist}
               onChange={(e) => set('artist', e.target.value)}
               required
            />
            <Input
               placeholder="Альбом (необязательно)"
               value={form.album}
               onChange={(e) => set('album', e.target.value)}
            />
            <div className="flex gap-3">
               <select
                  value={form.language}
                  onChange={(e) => set('language', e.target.value)}
                  className="h-11 flex-1 rounded-lg bg-[var(--color-surface)] px-3 text-sm outline-none"
               >
                  {LANGUAGES.map(([code, label]) => (
                     <option key={code} value={code}>
                        {label}
                     </option>
                  ))}
               </select>
               <Input
                  placeholder="Жанры через запятую"
                  value={form.genres}
                  onChange={(e) => set('genres', e.target.value)}
                  className="flex-1"
               />
            </div>
            <textarea
               placeholder="Текст песни (необязательно)"
               value={form.lyrics}
               onChange={(e) => set('lyrics', e.target.value)}
               rows={4}
               className="rounded-lg bg-[var(--color-surface)] p-3 text-sm outline-none"
            />
            <label className="flex items-center gap-2 text-sm">
               <input
                  type="checkbox"
                  checked={form.isCover}
                  onChange={(e) => set('isCover', e.target.checked)}
                  className="accent-[var(--color-brand)]"
               />
               Это кавер
            </label>
            {form.isCover && (
               <Input
                  placeholder="ID оригинального трека (необязательно)"
                  value={form.originalTrackId}
                  onChange={(e) => set('originalTrackId', e.target.value)}
               />
            )}

            <label className="text-sm text-[var(--color-muted)]">
               Аудиофайл *
               <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudio(e.target.files?.[0] ?? null)}
                  required
                  className="mt-1 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-surface)] file:px-4 file:py-2 file:text-white"
               />
            </label>
            <label className="text-sm text-[var(--color-muted)]">
               Обложка
               <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPicture(e.target.files?.[0] ?? null)}
                  className="mt-1 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-surface)] file:px-4 file:py-2 file:text-white"
               />
            </label>

            <Button type="submit" variant="primary" disabled={submitting}>
               {submitting ? 'Загрузка...' : 'Загрузить'}
            </Button>
         </form>
      </div>
   );
}
