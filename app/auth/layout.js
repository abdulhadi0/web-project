'use client';

import { Inter } from 'next/font/google';
import '../globals.css';
import { SessionProvider } from 'next-auth/react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children, session }) {
  return (

        <SessionProvider session={session}>
          <main className="">
            {children}
          </main>
        </SessionProvider>
  );
}
