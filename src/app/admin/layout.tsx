import React from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MunicipalPortalHeader } from '@/components/municipal/MunicipalPortalHeader';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-gray-900 flex flex-col font-sans">
      <MunicipalPortalHeader
        portalTitle="Waste Management System - Admin Center"
        portalSubtitle="Department of Municipal Waste & Environment Telemetry"
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f1f5f9]">
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
