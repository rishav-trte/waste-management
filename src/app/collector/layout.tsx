import React from 'react';
import { CollectorNav } from '@/components/shared/CollectorNav';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MunicipalPortalHeader } from '@/components/municipal/MunicipalPortalHeader';

export default async function CollectorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const allowedRoles = ['COLLECTOR', 'COMMISSIONER', 'SUB_ADMIN', 'ADMIN'];

  if (!session || !allowedRoles.includes(session.user.role)) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      <MunicipalPortalHeader
        portalTitle="Waste Management System - Collector Portal"
        portalSubtitle="Field Collection & GIS Operations"
      />
      <CollectorNav />
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4 bg-[#f1f5f9] dark:bg-slate-950">
        {children}
      </main>
      <footer className="bg-[#0f172a] text-gray-400 text-[11px] py-2 text-center border-t border-gray-700 mt-auto">
        © 2026 Waste Management System. All rights reserved.
      </footer>
    </div>
  );
}
