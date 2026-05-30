'use client';

import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PlayerBar } from '@/components/player/PlayerBar';
import { QueuePanel } from '@/components/player/QueuePanel';
import { FullScreenPlayer } from '@/components/player/FullScreenPlayer';

export function AppShell({ children }: { children: ReactNode }) {
   return (
      <div className="flex h-screen flex-col">
         <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
               <Topbar />
               <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8">
                  {children}
               </main>
            </div>
            <QueuePanel />
         </div>
         <PlayerBar />
         <FullScreenPlayer />
      </div>
   );
}
