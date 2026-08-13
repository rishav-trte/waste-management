import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // If there is no session, immediately redirect to login
  if (!session) {
    redirect('/login');
  }

  // Citizens and above are allowed here
  return <>{children}</>;
}
