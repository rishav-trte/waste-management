'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { PlusCircle, History, LogOut, Wifi } from 'lucide-react';

export function CollectorNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="bg-[#1e3a8a] border-b-2 border-[#f97316] text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-9 bg-gradient-to-b from-yellow-100 to-yellow-300 border border-yellow-500 rounded-t-full flex items-center justify-center p-0.5 shadow-sm shrink-0">
            <img
              src="https://placehold.co/40x50/eab308/000000?text=Emblem"
              alt="Emblem"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
          <div>
            <h1 className="text-xs font-bold text-yellow-400 uppercase tracking-wider leading-none" style={{ fontFamily: 'Georgia, serif' }}>
              Waste Mgmt Collector
            </h1>
            <span className="text-[10px] text-gray-200 font-medium flex items-center gap-1 mt-0.5">
              <Wifi className="w-2.5 h-2.5 text-green-400 animate-pulse" /> Telemetry Online
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-200 font-bold truncate max-w-[80px]">
            {session?.user?.name?.split(' ')[0]}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 bg-red-700 hover:bg-red-800 text-white rounded-sm transition-all"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <nav className="max-w-md mx-auto grid grid-cols-2 border-t border-blue-800 bg-[#0f172a]">
        <Link
          href="/collector/collect"
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            pathname === '/collector/collect' || pathname === '/collector/dashboard'
              ? 'text-white bg-[#f97316] shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-blue-900/60'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" /> New Collection
        </Link>
        <Link
          href="/collector/history"
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            pathname === '/collector/history'
              ? 'text-white bg-[#f97316] shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-blue-900/60'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Collection Log
        </Link>
      </nav>
    </header>
  );
}
