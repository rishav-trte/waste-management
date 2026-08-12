'use client';

import React, { useEffect, useState } from 'react';
import { History, CheckCircle2, AlertCircle, RefreshCw, Calendar, MapPin } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function CollectorHistoryPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/collector/history');
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (err) {
      toast.error('Failed to load collection log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold text-black tracking-tight">Your Activity Log</h2>
          <p className="text-xs text-slate-400">Past collections logged by your account.</p>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {collections.map((col) => (
          <div key={col.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{col.property?.ownerName}</span>
              {col.paymentStatus === 'PAID' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-semibold text-[10px]">
                  <CheckCircle2 className="w-3 h-3" /> PAID
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-semibold text-[10px]">
                  <AlertCircle className="w-3 h-3" /> PENDING
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 truncate">{col.property?.address}</p>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="font-extrabold text-emerald-400">{formatCurrency(col.amountCharged)}</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(col.collectedAt)}
              </span>
            </div>
          </div>
        ))}

        {collections.length === 0 && !loading && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No collection entries logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
