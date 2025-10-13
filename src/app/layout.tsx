import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ThemeRegistry from '@/lib/theme';
import DnDProvider from '@/lib/dnd-provider';
import { DropdownCacheProvider } from '@/context/DropdownCacheContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Custom Forms - POC',
  description: 'A dynamic form builder with drag and drop interface',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeRegistry>
          <DropdownCacheProvider>
            <DnDProvider>{children}</DnDProvider>
          </DropdownCacheProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
