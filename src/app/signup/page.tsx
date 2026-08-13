'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Lock, Mail, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { MunicipalPortalHeader } from '@/components/municipal/MunicipalPortalHeader';

export default function CitizenSignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register citizen account
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      toast.success('Account created successfully! Signing you in...');

      // Step 2: Auto log-in using credentials
      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.error('Account created, but auto sign-in failed. Please sign in manually.');
        router.push('/login');
      } else {
        toast.success('Signed in as Citizen!');
        router.push('/portal/request-collection');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-gray-900 flex flex-col font-sans">
      <MunicipalPortalHeader
        portalTitle="Daman Municipal Council"
        portalSubtitle="Citizen Waste Pickup Registration Portal"
        hideSignOut={true}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white border border-gray-300 shadow-md rounded-sm overflow-hidden grid lg:grid-cols-2">
          {/* Left Column: Official Municipal Info */}
          <div className="bg-[#1e3a8a] text-white p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-blue-800">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-16 bg-gradient-to-b from-yellow-100 to-yellow-300 border border-yellow-500 rounded-t-full flex items-center justify-center p-1 shadow-sm">
                  <ShieldCheck className="w-8 h-8 text-blue-900" />
                </div>
                <div>
                  <h2
                    className="text-xl font-bold uppercase tracking-wider text-yellow-400"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Daman Municipal Council
                  </h2>
                  <span className="text-xs text-gray-300 uppercase font-medium">
                    Citizen Services Portal
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-blue-700/60">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wide rounded-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Citizen Registration
                </div>
                <h3 className="text-2xl font-bold tracking-wide leading-snug">
                  Request On-Demand Doorstep Waste Collection
                </h3>
                <p className="text-gray-200 text-xs leading-relaxed">
                  Register your citizen profile to request doorstep solid waste pick-up, report uncollected bins, and track municipal collection status in real-time.
                </p>
              </div>

              {/* Security / Beta Warning Box */}
              <div className="bg-yellow-500/20 border border-yellow-400/40 p-3 rounded-sm text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-yellow-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-yellow-400" /> Beta Protection Limit
                </div>
                <p className="text-yellow-100 text-[11px] leading-relaxed">
                  Public citizen registration is currently capped at <strong>5 accounts total</strong> for security control and system load protection.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-blue-700/60 text-[11px] text-gray-300 flex items-center justify-between">
              <span>National Informatics Centre</span>
              <span>U.T. DNH & DD</span>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="p-6 sm:p-8 bg-slate-50 flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <h3
                  className="text-xl font-bold text-[#1e3a8a] uppercase tracking-wide border-b-2 border-[#1e3a8a] pb-1.5"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Create Citizen Profile
                </h3>
                <p className="text-xs text-gray-600 mt-2">
                  Fill in your official details to enable doorstep waste collection service.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#1e3a8a]"
                      placeholder="e.g. Ramesh Patel"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#1e3a8a]"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#1e3a8a]"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Password <span className="text-red-500">*</span>
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

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#1e3a8a]"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f97316] hover:bg-[#c2410c] disabled:bg-gray-400 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm mt-2"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Register & Access Portal <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-[#1e3a8a] hover:underline">
                      Sign In Here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#0f172a] text-gray-400 text-[11px] py-2 text-center border-t border-gray-700">
        © 2026 Daman Municipal Council. All rights reserved. Designed & Developed by National Informatics Centre.
      </footer>
    </div>
  );
}
