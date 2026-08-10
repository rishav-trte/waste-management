import React from 'react';
import { CollectorNav } from '@/components/shared/CollectorNav';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function CollectorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'COLLECTOR' && session.user.role !== 'ADMIN')) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <CollectorNav />
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4">
        {children}
      </main>
    </div>
  );
}
