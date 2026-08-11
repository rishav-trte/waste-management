'use client';

import React, { useState } from 'react';
import { LifeBuoy, Send, CheckCircle2, MessageSquare, ShieldCheck, PhoneCall, Mail, Headphones } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  { id: 'MISSED_PICKUP', label: 'Missed Waste Collection', icon: '🚨' },
  { id: 'BILLING_DISCREPANCY', label: 'Billing / Tariff Issue', icon: '🧾' },
  { id: 'DAMAGED_BIN', label: 'Damaged Container / Bin', icon: '🗑️' },
  { id: 'GENERAL_INQUIRY', label: 'General Inquiry & Feedback', icon: '💬' },
];

export default function PublicSupportPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('MISSED_PICKUP');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, category, subject, description }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Support ticket submitted to Municipal Help Desk!');
        setSubmittedTicket(data.ticket);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setDescription('');
      } else {
        toast.error(data.error || 'Failed to submit ticket');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-800 rounded-3xl p-6 sm:p-10 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
          <Headphones className="w-4 h-4" /> Freshdesk / Indian SaaS Powered Helpdesk
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Municipal Citizen Support Center</h1>
        <p className="text-xs sm:text-sm text-blue-200 max-w-2xl leading-relaxed">
          Need assistance with waste collection, sanitation fees, or bin replacement? Submit a ticket to our 24/7 Municipal Help Desk.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Support Form */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-emerald-400" /> Raise a Support Ticket
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sunita Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sunita@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject Summary</label>
              <input
                type="text"
                required
                placeholder="e.g. Waste pickup missed on Sector 15 route today"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Detailed Description</label>
              <textarea
                required
                rows={4}
                placeholder="Please describe your complaint or request with address details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Transmitting Ticket...' : 'Submit Support Ticket'} <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Ticket Confirmation Box */}
          {submittedTicket && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" /> Ticket Logged Successfully!
              </div>
              <p className="text-xs text-slate-300">
                Ticket Reference ID: <span className="font-mono font-bold text-white">{submittedTicket.id}</span>
                {submittedTicket.freshdeskTicketId && (
                  <span className="ml-2 text-emerald-400 font-semibold">(Freshdesk Ticket #{submittedTicket.freshdeskTicketId})</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Contact Info & SaaS Widget Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Emergency Helpline</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Toll-Free Control Room</p>
                  <p className="font-bold text-white">1800-11-WASTE (92783)</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Support Email</p>
                  <p className="font-bold text-white">support@wastemgmt.gov.in</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-blue-950/40 border border-blue-800/80 rounded-3xl space-y-2 text-xs text-blue-200">
            <div className="font-bold text-yellow-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Freshdesk / Indian SaaS Integration
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Tickets submitted here sync directly with Freshdesk / Zoho Desk for automated routing to local ward officers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
