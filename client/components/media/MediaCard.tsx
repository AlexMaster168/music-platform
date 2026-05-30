'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { Cover } from '@/components/common/Cover';
import { cn } from '@/lib/utils';

interface MediaCardProps {
   title: string;
   subtitle?: string;
   cover?: string;
   href?: string;
   rounded?: boolean;
   onPlay?: () => void;
}

export function MediaCard({
   title,
   subtitle,
   cover,
   href,
   rounded,
   onPlay,
}: MediaCardProps) {
   const inner = (
      <div className="group w-40 shrink-0">
         <div className="relative">
            <Cover
               src={cover}
               alt={title}
               rounded={rounded}
               className="aspect-square w-40"
            />
            {onPlay && (
               <button
                  onClick={(e) => {
                     e.preventDefault();
                     onPlay();
                  }}
                  className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-brand)] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                  aria-label="Играть"
               >
                  <Play className="h-5 w-5 fill-white" />
               </button>
            )}
         </div>
         <div className={cn('mt-2 truncate text-sm font-medium', rounded && 'text-center')}>
            {title}
         </div>
         {subtitle && (
            <div
               className={cn(
                  'truncate text-xs text-[var(--color-muted)]',
                  rounded && 'text-center',
               )}
            >
               {subtitle}
            </div>
         )}
      </div>
   );

   return href ? (
      <Link href={href} className="block">
         {inner}
      </Link>
   ) : (
      inner
   );
}
