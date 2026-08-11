'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, ArrowRight, Lock, Mail, UserCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { MunicipalPortalHeader } from '@/components/municipal/MunicipalPortalHeader';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('commissioner@wastemgmt.gov.in');
  const [password, setPassword] = useState('Commissioner@123456');
  const [selectedRole, setSelectedRole] = useState<'COMMISSIONER' | 'SUB_ADMIN' | 'ADMIN' | 'COLLECTOR' | 'USER'>('COMMISSIONER');
  const [loading, setLoading] = useState(false);

  const handleQuickFill = (targetRole: 'COMMISSIONER' | 'SUB_ADMIN' | 'ADMIN' | 'COLLECTOR' | 'USER') => {
    setSelectedRole(targetRole);
    switch (targetRole) {
      case 'COMMISSIONER':
        setEmail('commissioner@wastemgmt.gov.in');
        setPassword('Commissioner@123456');
        break;
      case 'SUB_ADMIN':
        setEmail('subadmin@wastemgmt.gov.in');
        setPassword('Subadmin@123456');
        break;
      case 'ADMIN':
        setEmail('admin@wastemgmt.gov.in');
        setPassword('Admin@123456');
        break;
      case 'COLLECTOR':
        setEmail('collector1@wastemgmt.gov.in');
        setPassword('Collector@123456');
        break;
      case 'USER':
        setEmail('citizen@wastemgmt.gov.in');
        setPassword('Citizen@123456');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error || 'Failed to sign in');
      } else {
        toast.success('Signed in successfully!');
        // Fetch current session to get role and redirect to correct portal
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        const role = sessionData?.user?.role;

        if (['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'].includes(role)) {
          router.push('/admin/dashboard');
        } else if (role === 'USER') {
          router.push('/portal/request-collection');
        } else {
          router.push('/collector/collect');
        }
        router.refresh();
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-gray-900 flex flex-col font-sans">
      {/* Top Header matching Municipal Theme */}
      <MunicipalPortalHeader portalTitle="Daman Municipal Council" portalSubtitle="Official Waste & Environmental Operations Portal" />

      {/* Main Login Body */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white border border-gray-300 shadow-md rounded-sm overflow-hidden grid lg:grid-cols-2">
          {/* Left Column: Official Branding */}
          <div className="bg-[#1e3a8a] text-white p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-blue-800">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-16 bg-gradient-to-b from-yellow-100 to-yellow-300 border border-yellow-500 rounded-t-full flex items-center justify-center p-1 shadow-sm">
                  <ShieldCheck className="w-8 h-8 text-blue-900" />
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-yellow-400" style={{ fontFamily: 'Georgia, serif' }}>
                    Daman Municipal Council
                  </h2>
                  <span className="text-xs text-gray-300 uppercase font-medium">U.T. Administration of DNH & DD</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-blue-700/60">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f97316] text-white text-[11px] font-bold uppercase tracking-wide rounded-sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> Official Operations Engine
                </div>
                <h3 className="text-2xl font-bold tracking-wide leading-snug">
                  Municipal Solid Waste Telemetry & Billing Portal
                </h3>
                <p className="text-gray-200 text-xs leading-relaxed">
                  Real-time GIS route tracking, automated property tariff auditing, field collector telemetry, and verified citizen collections management.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-700/60 text-xs">
                <div className="bg-blue-900/50 p-2.5 border border-blue-700 rounded-sm">
                  <p className="text-lg font-bold text-yellow-400">15 Wards</p>
                  <p className="text-gray-300 text-[11px]">Full Municipal Coverage</p>
                </div>
                <div className="bg-blue-900/50 p-2.5 border border-blue-700 rounded-sm">
                  <p className="text-lg font-bold text-yellow-400">RBAC Enabled</p>
                  <p className="text-gray-300 text-[11px]">Commissioner, Sub Admin, Collector, Citizen</p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-blue-700/60 text-[11px] text-gray-300">
              <span>National Informatics Centre</span>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="p-6 sm:p-8 bg-slate-50 flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#1e3a8a] uppercase tracking-wide border-b-2 border-[#1e3a8a] pb-1.5" style={{ fontFamily: 'Georgia, serif' }}>
                  Official Sign In
                </h3>
                <p className="text-xs text-gray-600 mt-2">
                  Select your authorization role and enter registered credentials.
                </p>
              </div>

              {/* Role Quick Selector Pills */}
              <div className="flex flex-wrap gap-1.5 p-1.5 bg-gray-200 border border-gray-300 rounded-sm text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickFill('COMMISSIONER')}
                  className={`px-2.5 py-1 font-bold uppercase transition-all ${
                    selectedRole === 'COMMISSIONER'
                      ? 'bg-[#1e3a8a] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Commissioner
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('SUB_ADMIN')}
                  className={`px-2.5 py-1 font-bold uppercase transition-all ${
                    selectedRole === 'SUB_ADMIN'
                      ? 'bg-[#1e3a8a] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Sub Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('COLLECTOR')}
                  className={`px-2.5 py-1 font-bold uppercase transition-all ${
                    selectedRole === 'COLLECTOR'
                      ? 'bg-[#1e3a8a] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Collector
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('USER')}
                  className={`px-2.5 py-1 font-bold uppercase transition-all ${
                    selectedRole === 'USER'
                      ? 'bg-[#1e3a8a] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Citizen
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Official Email ID
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#1e3a8a]"
                      placeholder="name@wastemgmt.gov.in"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#1e3a8a]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f97316] hover:bg-[#c2410c] disabled:bg-gray-400 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Sign In to Workspace <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-sm text-xs space-y-1">
                  <p className="font-bold text-[#1e3a8a]">💡 Quick Fill Credentials ({selectedRole}):</p>
                  <p className="text-gray-700 font-mono text-[11px]">
                    {email} / {password}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="bg-[#0f172a] text-gray-400 text-[11px] py-2 text-center border-t border-gray-700">
        © 2026 Daman Municipal Council. All rights reserved. Designed & Developed by National Informatics Centre.
      </footer>
    </div>
  );
}
