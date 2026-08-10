'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Search, ChevronRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function CollectionsAuditPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCollections = async (cursor?: string) => {
    if (cursor) setLoadingMore(true);
    else setLoading(true);

    try {
      let url = `/api/admin/collections?limit=10`;
      if (cursor) url += `&cursor=${cursor}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();

      if (cursor) {
        setCollections((prev) => [...prev, ...(data.collections || [])]);
      } else {
        setCollections(data.collections || []);
      }
      setNextCursor(data.nextCursor);
    } catch (err) {
      toast.error('Failed to load collection records');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Collection Audit Log</h1>
          <p className="text-xs text-slate-400 mt-1">
            Server-side cursor-paginated record browser optimized for high-volume government operational data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="">All Payment Statuses</option>
            <option value="PAID">PAID Only</option>
            <option value="PENDING">PENDING Only</option>
            <option value="FAILED">FAILED Only</option>
          </select>

          <button
            onClick={() => fetchCollections()}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-all"
            title="Refresh Log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Log ID</th>
                <th className="py-3.5 px-4">Property & Owner</th>
                <th className="py-3.5 px-4">Field Officer</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Method & Ref</th>
                <th className="py-3.5 px-4">GPS Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Collected At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {collections.map((col) => (
                <tr key={col.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{col.id.substring(0, 8)}...</td>
                  <td className="py-3.5 px-4 font-medium text-white">
                    <p className="font-bold text-slate-100">{col.property?.ownerName}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{col.property?.address}</p>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{col.collector?.name}</td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-400">
                    {formatCurrency(col.amountCharged)}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-200">{col.paymentMethod}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{col.paymentReference || 'N/A'}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {col.latitude?.toFixed(4)}, {col.longitude?.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4">
                    {col.paymentStatus === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-semibold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-semibold text-[10px]">
                        <AlertCircle className="w-3 h-3" /> PENDING
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{formatDate(col.collectedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Load More Pagination Button */}
        {nextCursor && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-center">
            <button
              onClick={() => fetchCollections(nextCursor)}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all shadow-sm"
            >
              {loadingMore ? 'Fetching Next Page...' : 'Load More Records (Cursor-based Pagination)'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
