'use client';

import React, { useEffect, useState } from 'react';
import { LifeBuoy, CheckCircle2, Clock, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSupportDeskPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/support');
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateTicket = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Ticket status updated to ${newStatus}`);
        fetchTickets();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Unexpected error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Support Desk Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sub-Admin & Commissioner help desk interface integrated with Freshdesk / Indian SaaS ticketing pipelines.
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Tickets
        </button>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-4">
        {tickets.length === 0 ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            No support tickets logged in system.
          </div>
        ) : (
          tickets.map((t) => (
            <div
              key={t.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{t.subject}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Submitted by <span className="text-slate-200 font-semibold">{t.name}</span> ({t.email})
                    {t.phone && <span className="ml-1 text-slate-400">• {t.phone}</span>}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {t.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateTicket(t.id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {t.status === 'OPEN' && (
                    <button
                      onClick={() => handleUpdateTicket(t.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      In Progress
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-300 leading-relaxed">
                {t.description}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Category: <strong className="text-slate-300">{t.category}</strong></span>
                <span>Submitted: {new Date(t.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
