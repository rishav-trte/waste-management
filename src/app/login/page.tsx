'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trash2, ShieldCheck, Truck, ArrowRight, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@wastemgmt.gov.in');
  const [password, setPassword] = useState('Admin@123456');
  const [role, setRole] = useState<'ADMIN' | 'COLLECTOR'>('ADMIN');
  const [loading, setLoading] = useState(false);

  const handleQuickFill = (targetRole: 'ADMIN' | 'COLLECTOR') => {
    setRole(targetRole);
    if (targetRole === 'ADMIN') {
      setEmail('admin@wastemgmt.gov.in');
      setPassword('Admin@123456');
    } else {
      setEmail('collector1@wastemgmt.gov.in');
      setPassword('Collector@123456');
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
        if (role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/collector/dashboard');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950 text-white">
      {/* Left Column: Hero branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl backdrop-blur-md">
            <Trash2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">EcoTrack Gov</h1>
            <p className="text-xs text-emerald-400 font-medium">Municipal Waste Operations</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md my-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> Government-Scale Operations Engine
          </div>
          <h2 className="text-4xl font-extrabold leading-tight text-white">
            Smart Waste Management & Real-time Telemetry
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Monitor municipal collection routes, audit dynamic property tariffs, track field collectors with spatial GIS, and process verified payments in real time.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <p className="text-2xl font-bold text-emerald-400">10M+</p>
              <p className="text-xs text-slate-400">Daily Collections Capacity</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">99.99%</p>
              <p className="text-xs text-slate-400">Audit Compliance Rate</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © 2026 Department of Municipal Waste & Environment. All Rights Reserved.
        </div>
      </div>

      {/* Right Column: Interactive Login Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">Portal Sign In</h2>
            <p className="text-sm text-slate-400">
              Select your role and enter credentials to access your workspace.
            </p>
          </div>

          {/* Quick Fill Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleQuickFill('ADMIN')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg transition-all ${
                role === 'ADMIN'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Admin Portal
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('COLLECTOR')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg transition-all ${
                role === 'COLLECTOR'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Truck className="w-4 h-4" /> Collector Portal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    placeholder="name@wastemgmt.gov.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-medium text-sm rounded-xl shadow-lg shadow-emerald-950/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Sign In to Portal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl space-y-1">
              <p className="text-xs font-semibold text-emerald-400">💡 Demo Credentials Loaded:</p>
              <p className="text-xs text-slate-400 font-mono">
                {role === 'ADMIN' ? 'admin@wastemgmt.gov.in / Admin@123456' : 'collector1@wastemgmt.gov.in / Collector@123456'}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
