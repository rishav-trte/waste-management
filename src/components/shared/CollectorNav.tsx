'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Truck, PlusCircle, History, LogOut, Wifi } from 'lucide-react';

export function CollectorNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
            <Truck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">Collector App</h1>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <Wifi className="w-2.5 h-2.5 animate-pulse" /> Online GPS Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium max-w-[100px] truncate hidden sm:inline">
            {session?.user?.name?.split(' ')[0]}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <nav className="max-w-md mx-auto grid grid-cols-2 border-t border-slate-800/80 bg-slate-950">
        <Link
          href="/collector/collect"
          className={`flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all ${
            pathname === '/collector/collect' || pathname === '/collector/dashboard'
              ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-950/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" /> New Collection
        </Link>
        <Link
          href="/collector/history"
          className={`flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all ${
            pathname === '/collector/history'
              ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-950/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" /> Collection Log
        </Link>
      </nav>
    </header>
  );
}
