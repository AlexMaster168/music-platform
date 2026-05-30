'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector, useCurrentTrack } from '@/store/hooks';
import {
   clearSeek,
   pause,
   setCurrentTime,
   setDuration,
} from '@/store/playerSlice';
import { next } from '@/store/queueSlice';
import { fileUrl } from '@/lib/api';
import { recordListen } from '@/hooks/queries';

/**
 * Единственный аудио-элемент приложения. Не рендерит UI —
 * слушает состояние Redux (текущий трек, play/pause, громкость, перемотка)
 * и управляет HTMLAudioElement. Заменяет старый глобальный `let audio`.
 */
export function AudioEngine() {
   const dispatch = useAppDispatch();
   const audioRef = useRef<HTMLAudioElement | null>(null);

   const track = useCurrentTrack();
   const trackId = track?._id;
   const isPlaying = useAppSelector((s) => s.player.isPlaying);
   const volume = useAppSelector((s) => s.player.volume);
   const muted = useAppSelector((s) => s.player.muted);
   const seekTo = useAppSelector((s) => s.player.seekTo);
   const repeat = useAppSelector((s) => s.queue.repeat);
   const index = useAppSelector((s) => s.queue.index);
   const queueLen = useAppSelector((s) => s.queue.items.length);

   // создаём аудио-элемент один раз (только в браузере, после маунта)
   useEffect(() => {
      if (audioRef.current === null && typeof window !== 'undefined') {
         audioRef.current = new Audio();
      }
   }, []);

   // постоянные слушатели прогресса/метаданных
   useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const onTime = () => dispatch(setCurrentTime(audio.currentTime));
      const onMeta = () => dispatch(setDuration(audio.duration || 0));
      audio.addEventListener('timeupdate', onTime);
      audio.addEventListener('loadedmetadata', onMeta);
      return () => {
         audio.removeEventListener('timeupdate', onTime);
         audio.removeEventListener('loadedmetadata', onMeta);
      };
   }, [dispatch]);

   // обработка конца трека с учётом repeat/очереди
   useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const onEnded = () => {
         if (repeat === 'one') {
            audio.currentTime = 0;
            void audio.play();
            return;
         }
         const isLast = index >= queueLen - 1;
         if (isLast && repeat === 'off') {
            dispatch(pause());
         } else {
            dispatch(next());
         }
      };
      audio.addEventListener('ended', onEnded);
      return () => audio.removeEventListener('ended', onEnded);
   }, [repeat, index, queueLen, dispatch]);

   // смена трека → загрузка нового источника
   useEffect(() => {
      const audio = audioRef.current;
      if (!audio || !track) return;
      const url = fileUrl(track.audio);
      if (!url) return;
      audio.src = url;
      audio.load();
      dispatch(setCurrentTime(0));
      recordListen(track._id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [trackId]);

   // play / pause
   useEffect(() => {
      const audio = audioRef.current;
      if (!audio || !track) return;
      if (isPlaying) {
         void audio.play();
      } else {
         audio.pause();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isPlaying, trackId]);

   // громкость
   useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = muted ? 0 : volume;
   }, [volume, muted, trackId]);

   // перемотка
   useEffect(() => {
      const audio = audioRef.current;
      if (!audio || seekTo == null) return;
      audio.currentTime = seekTo;
      dispatch(clearSeek());
   }, [seekTo, dispatch]);

   return null;
}
