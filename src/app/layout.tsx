import type { Metadata } from 'next';
import './globals.css';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Waste Management System | Government Scale Platform',
  description: 'Enterprise waste management solution with real-time tracking, dynamic pricing, and mobile field collections.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="font-sans antialiased h-full bg-slate-50 text-slate-900">
        <NextAuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </NextAuthProvider>
      </body>
    </html>
  );
}
