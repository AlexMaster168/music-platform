import { Music } from 'lucide-react';
import { fileUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CoverProps {
   src?: string;
   alt?: string;
   rounded?: boolean;
   className?: string;
}

export function Cover({ src, alt, rounded, className }: CoverProps) {
   const url = fileUrl(src);
   const shape = rounded ? 'rounded-full' : 'rounded-lg';
   if (url) {
      // обычный <img>: обложки приходят с произвольных хостов, настраивать
      // next/image loader под них смысла нет
      return (
         // eslint-disable-next-line @next/next/no-img-element
         <img
            src={url}
            alt={alt ?? ''}
            className={cn('object-cover bg-[var(--color-surface)]', shape, className)}
         />
      );
   }
   return (
      <div
         className={cn(
            'flex items-center justify-center bg-[var(--color-surface)] text-[var(--color-muted)]',
            shape,
            className,
         )}
      >
         <Music className="h-1/3 w-1/3" />
      </div>
   );
}
