'use client';

import { Play, Trash2, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { play, toggleQueue } from '@/store/playerSlice';
import { clearQueue, jumpTo, removeAt } from '@/store/queueSlice';
import { Cover } from '@/components/common/Cover';
import { artistName } from '@/types';
import { cn } from '@/lib/utils';

export function QueuePanel() {
   const dispatch = useAppDispatch();
   const open = useAppSelector((s) => s.player.queueOpen);
   const { items, index } = useAppSelector((s) => s.queue);

   if (!open) return null;

   return (
      <aside className="hidden w-80 shrink-0 flex-col border-l border-[var(--color-line)] bg-[var(--color-elevated)] lg:flex">
         <div className="flex items-center justify-between px-4 py-3">
            <h3 className="font-semibold">Очередь</h3>
            <div className="flex items-center gap-1">
               <button
                  onClick={() => dispatch(clearQueue())}
                  className="text-[var(--color-muted)] hover:text-white"
                  aria-label="Очистить"
               >
                  <Trash2 className="h-4 w-4" />
               </button>
               <button
                  onClick={() => dispatch(toggleQueue())}
                  className="text-[var(--color-muted)] hover:text-white"
                  aria-label="Закрыть"
               >
                  <X className="h-5 w-5" />
               </button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-2 pb-4">
            {items.length === 0 ? (
               <p className="px-3 py-6 text-sm text-[var(--color-muted)]">
                  Очередь пуста
               </p>
            ) : (
               items.map((t, i) => (
                  <div
                     key={`${t._id}-${i}`}
                     className={cn(
                        'group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/5',
                        i === index && 'bg-white/5',
                     )}
                  >
                     <button
                        onClick={() => {
                           dispatch(jumpTo(i));
                           dispatch(play());
                        }}
                        className="relative h-10 w-10 shrink-0"
                     >
                        <Cover src={t.picture} alt={t.name} className="h-10 w-10" />
                        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 group-hover:opacity-100">
                           <Play className="h-4 w-4 fill-white" />
                        </span>
                     </button>
                     <div className="min-w-0 flex-1">
                        <div
                           className={cn(
                              'truncate text-sm',
                              i === index && 'text-[var(--color-brand)]',
                           )}
                        >
                           {t.name}
                        </div>
                        <div className="truncate text-xs text-[var(--color-muted)]">
                           {artistName(t)}
                        </div>
                     </div>
                     <button
                        onClick={() => dispatch(removeAt(i))}
                        className="opacity-0 group-hover:opacity-100 text-[var(--color-muted)] hover:text-white"
                        aria-label="Убрать"
                     >
                        <X className="h-4 w-4" />
                     </button>
                  </div>
               ))
            )}
         </div>
      </aside>
   );
}
