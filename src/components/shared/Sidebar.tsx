'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Building2,
  Tags,
  Receipt,
  LogOut,
  ShieldCheck,
  MapPin,
  FileSpreadsheet,
  Truck,
  LifeBuoy,
  History,
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'Properties & GIS Map', icon: Building2 },
  { href: '/admin/property-types', label: 'Property Types & Price', icon: Tags },
  { href: '/admin/excel-upload', label: 'Excel Bulk Importer', icon: FileSpreadsheet },
  { href: '/admin/waste-requests', label: 'Waste Collection Requests', icon: Truck },
  { href: '/admin/support', label: 'Support Desk (Freshdesk)', icon: LifeBuoy },
  { href: '/admin/audit-logs', label: 'Audit Trail Logs', icon: History },
  { href: '/admin/collections', label: 'Collections Audit', icon: MapPin },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'COMMISSIONER':
        return 'Commissioner (Superadmin)';
      case 'SUB_ADMIN':
        return 'Sub Admin Operations';
      case 'ADMIN':
        return 'System Administrator';
      default:
        return 'Municipal Officer';
    }
  };

  return (
    <aside className="w-64 bg-[#1e3a8a] border-r border-blue-900 text-white flex flex-col justify-between hidden md:flex shrink-0 shadow-lg">
      <div className="p-4 space-y-6">
        {/* Emblem & Brand Header */}
        <div className="flex items-center gap-3 p-3 bg-blue-950/60 border border-blue-800 rounded-sm">
          <div className="w-9 h-12 bg-gradient-to-b from-yellow-100 to-yellow-300 border border-yellow-500 rounded-t-full flex items-center justify-center p-0.5 shadow-sm shrink-0">
            <ShieldCheck className="w-6 h-6 text-blue-900" />
          </div>
          <div>
            <h1
              className="text-sm font-bold text-yellow-400 tracking-wide uppercase"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Waste Mgmt Portal
            </h1>
            <div className="flex items-center gap-1 text-[10px] text-gray-300 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-[#f97316]" /> {getRoleBadge(session?.user?.role)}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300 border-b border-blue-800/80 mb-2">
            Main Administration
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#f97316] text-white shadow-sm border-l-4 border-white'
                    : 'text-gray-200 hover:text-white hover:bg-blue-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-300'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-3 m-3 bg-blue-950/70 border border-blue-800 rounded-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-xs border border-white">
            {session?.user?.name?.[0] || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{session?.user?.name || 'Municipal Officer'}</p>
            <p className="text-[10px] text-yellow-300 font-semibold truncate">{getRoleBadge(session?.user?.role)}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all border border-red-900"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
