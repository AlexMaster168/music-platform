import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
   title: 'Музыка — стриминг в стиле YouTube Music',
   description:
      'Музыкальная платформа: треки, плейлисты, альбомы, артисты, каверы на разных языках.',
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="ru" className="dark">
         <body>
            <Providers>
               <AppShell>{children}</AppShell>
            </Providers>
         </body>
      </html>
   );
}
