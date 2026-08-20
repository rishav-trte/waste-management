'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Filter, ShieldCheck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchWasteRequests, updateWasteRequestStatus } from '@/store/slices/wasteRequestsSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SubAdminWasteRequestsPage() {
  const dispatch = useAppDispatch();
  const { items: requests, loading } = useAppSelector((state) => state.wasteRequests);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED'>('ALL');

  useEffect(() => {
    dispatch(fetchWasteRequests());
  }, [dispatch]);

  const handleUpdateStatus = async (id: string, newStatus: string, collectorId?: string) => {
    try {
      const res = await fetch('/api/portal/waste-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, collectorId }),
      });

      if (res.ok) {
        toast.success(`Request status updated to ${newStatus}`);
        dispatch(updateWasteRequestStatus({ id, status: newStatus }));
        dispatch(fetchWasteRequests());
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Unexpected error');
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#1e3a8a]" /> Citizen Waste Pickup Dispatch & Audit Board
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Official Commissioner & Sub-Admin validation portal to review citizen pickup requests, verify telemetry, and dispatch field collectors.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-1 rounded-lg text-xs">
          {(['ALL', 'PENDING', 'ASSIGNED', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-md font-bold uppercase text-[10px] tracking-wider transition-all ${
                filter === status
                  ? 'bg-[#1e3a8a] text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-100 dark:bg-slate-950/80 text-gray-500 dark:text-slate-400 font-semibold border-b border-gray-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Citizen / User</th>
                <th className="py-3.5 px-4">Address / Location</th>
                <th className="py-3.5 px-4">Category & Waste Type</th>
                <th className="py-3.5 px-4">Preferred Date</th>
                <th className="py-3.5 px-4">Validation Status</th>
                <th className="py-3.5 px-4 text-right">Commissioner Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800/60 text-gray-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <LoadingSpinner size="md" label="Fetching citizen waste pickup dispatch queue..." />
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 dark:text-slate-500">
                    No citizen collection requests logged for filter '{filter}'.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-100 dark:bg-gray-50 dark:bg-slate-800/30 transition-all">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 dark:text-white">{r.user?.name || 'Citizen'}</div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-400">{r.user?.email}</div>
                      {r.phone && (
                        <a
                          href={`tel:${r.phone}`}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-0.5 hover:underline"
                        >
                          <Phone className="w-3 h-3" /> {r.phone}
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-gray-900 dark:text-white truncate">{r.address}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {(r.latitude || r.longitude) && (
                          <a
                            href={`https://maps.google.com/?q=${r.latitude},${r.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-blue-400 hover:underline inline-flex items-center gap-0.5"
                          >
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            GPS: {r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)} ↗
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-400 font-bold block text-[11px]">{r.propertyType?.name}</span>
                      <span className="text-gray-700 dark:text-slate-300 text-[10px] font-semibold block">{r.wasteType}</span>
                      {(r as any).price !== undefined && (
                        <span className="text-yellow-400 text-[10px] font-bold mt-1 block">Paid: ₹{(r as any).price}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500 dark:text-slate-400">
                      {new Date(r.preferredDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : r.status === 'ASSIGNED'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : r.status === 'CANCELLED'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {r.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'ASSIGNED')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-all shadow-md"
                          >
                            Dispatch Team
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'CANCELLED')}
                            className="px-2.5 py-1.5 bg-red-600/80 hover:bg-red-600 text-white font-bold text-[11px] rounded-lg transition-all shadow-md"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'COMPLETED')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg transition-all shadow-md"
                        >
                          Validate & Mark Completed
                        </button>
                      )}
                      {r.status === 'COMPLETED' && (
                        <span className="text-[11px] font-semibold text-emerald-400 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
