'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { PlusCircle, History, LogOut, Wifi, Truck } from 'lucide-react';

export function CollectorNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="bg-[#1e3a8a] border-b-2 border-[#f97316] text-white sticky top-0 z-30 shadow-md">
      {/* Mobile Tab Navigation */}
      <nav className="max-w-md mx-auto grid grid-cols-2 border-t border-blue-800 bg-[#0f172a]">
        <Link
          href="/collector/requests"
          className={`flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
            pathname === '/collector/requests'
              ? 'text-white bg-[#f97316] shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-blue-900/60'
          }`}
        >
          <Truck className="w-3.5 h-3.5 shrink-0 text-yellow-400" /> Requests
        </Link>
        <Link
          href="/collector/history"
          className={`flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
            pathname === '/collector/history'
              ? 'text-white bg-[#f97316] shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-blue-900/60'
          }`}
        >
          <History className="w-3.5 h-3.5 shrink-0" /> History
        </Link>
      </nav>
    </header>
  );
}
