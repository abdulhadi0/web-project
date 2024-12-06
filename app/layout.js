'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/custom/header';
import Footer from '../components/custom/footer'; // Fixed Footer import
import { SessionProvider } from 'next-auth/react';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children, session }) {
  return (
    <html lang="en">
      <head>
        <title>RateMyProfessor</title>
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <SessionProvider session={session}>
          <Header />
          <main className="flex-grow container mx-auto">
            {children}
            <Toaster />
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
