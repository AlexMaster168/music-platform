'use client';

import { useState } from 'react';
import { ListPlus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
   useAddToPlaylist,
   useCreatePlaylist,
   useMyPlaylists,
} from '@/hooks/queries';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AddToPlaylistButton({ trackId }: { trackId: string }) {
   const { isAuthed } = useAuth();
   const [open, setOpen] = useState(false);
   const [newTitle, setNewTitle] = useState('');
   const { data: playlists } = useMyPlaylists(isAuthed && open);
   const addTo = useAddToPlaylist();
   const create = useCreatePlaylist();

   if (!isAuthed) return null;

   const handleAdd = async (playlistId: string) => {
      await addTo.mutateAsync({ playlistId, trackId });
      toast.success('Добавлено в плейлист');
      setOpen(false);
   };

   const handleCreate = async () => {
      if (!newTitle.trim()) return;
      const pl = await create.mutateAsync({ title: newTitle.trim() });
      await addTo.mutateAsync({ playlistId: pl._id, trackId });
      toast.success(`Создан плейлист «${pl.title}» и добавлен трек`);
      setNewTitle('');
      setOpen(false);
   };

   return (
      <div className="relative">
         <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
            <ListPlus className="h-4 w-4" /> В плейлист
         </Button>
         {open && (
            <div className="absolute z-30 mt-2 w-64 rounded-xl border border-[var(--color-line)] bg-[var(--color-elevated)] p-2 shadow-2xl">
               <div className="max-h-52 overflow-y-auto">
                  {(playlists ?? []).map((pl) => (
                     <button
                        key={pl._id}
                        onClick={() => handleAdd(pl._id)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"
                     >
                        {pl.title}
                     </button>
                  ))}
                  {playlists && playlists.length === 0 && (
                     <p className="px-3 py-2 text-xs text-[var(--color-muted)]">
                        У тебя пока нет плейлистов
                     </p>
                  )}
               </div>
               <div className="mt-2 flex gap-2 border-t border-[var(--color-line)] pt-2">
                  <Input
                     value={newTitle}
                     onChange={(e) => setNewTitle(e.target.value)}
                     placeholder="Новый плейлист"
                     className="h-9"
                     onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  />
                  <Button size="icon" variant="primary" onClick={handleCreate}>
                     <Plus className="h-4 w-4" />
                  </Button>
               </div>
            </div>
         )}
      </div>
   );
}
