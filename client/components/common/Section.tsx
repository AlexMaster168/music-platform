import Link from 'next/link';
import type { ReactNode } from 'react';

interface SectionProps {
   title: string;
   href?: string;
   children: ReactNode;
}

export function Section({ title, href, children }: SectionProps) {
   return (
      <section className="mb-8">
         <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            {href && (
               <Link
                  href={href}
                  className="text-xs text-[var(--color-muted)] hover:text-white"
               >
                  Показать всё
               </Link>
            )}
         </div>
         <div className="flex gap-4 overflow-x-auto pb-2">{children}</div>
      </section>
   );
}
