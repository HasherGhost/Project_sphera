import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-gray-950 text-gray-50 flex flex-col min-h-screen`}>
        {/* Universal Top Nav for App */}
        <header className="border-b border-white/10 bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-title font-bold text-xl text-white">SyncUp</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">Verified</span>
            </div>
            <nav className="hidden md:flex gap-6 font-medium text-sm text-gray-300">
              <a href="/dashboard" className="hover:text-white transition">Network</a>
              <a href="/events" className="hover:text-white transition">Events</a>
              <a href="/verification" className="hover:text-white transition">Identity</a>
              <a href="/rewards" className="hover:text-white transition">Rewards</a>
            </nav>
            <div className="flex items-center gap-4">
              <img src="/avatars/maggot.png" alt="Me" className="rounded-full object-cover border border-slate-700 bg-slate-800 w-8 h-8" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
