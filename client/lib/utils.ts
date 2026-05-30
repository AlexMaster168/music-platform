import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

export function formatTime(seconds?: number): string {
   if (!seconds || Number.isNaN(seconds)) return '0:00';
   const m = Math.floor(seconds / 60);
   const s = Math.floor(seconds % 60);
   return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatCount(n?: number): string {
   if (!n) return '0';
   if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
   if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
   return String(n);
}

const LANG_NAMES: Record<string, string> = {
   en: 'English',
   ru: 'Русский',
   es: 'Español',
   fr: 'Français',
   de: 'Deutsch',
   it: 'Italiano',
   pt: 'Português',
   ja: '日本語',
   ko: '한국어',
   zh: '中文',
   uk: 'Українська',
   tr: 'Türkçe',
};

export function languageName(code?: string): string {
   if (!code) return 'Unknown';
   return LANG_NAMES[code] ?? code.toUpperCase();
}
