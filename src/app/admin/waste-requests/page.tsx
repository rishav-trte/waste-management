'use client';

import React, { useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchWasteRequests, updateWasteRequestStatus } from '@/store/slices/wasteRequestsSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SubAdminWasteRequestsPage() {
  const dispatch = useAppDispatch();
  const { items: requests, loading } = useAppSelector((state) => state.wasteRequests);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Citizen Waste Pickup Dispatch Board</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sub-Admin & Commissioner dashboard to review citizen on-demand collection requests and dispatch field teams.
          </p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Citizen / User</th>
                <th className="py-3.5 px-4">Address / Category</th>
                <th className="py-3.5 px-4">Waste Type</th>
                <th className="py-3.5 px-4">Preferred Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <LoadingSpinner size="md" label="Fetching citizen waste pickup dispatch queue..." />
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No active citizen collection requests logged.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{r.user?.name || 'Citizen'}</div>
                      <div className="text-[10px] text-slate-400">{r.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-white truncate">{r.address}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-emerald-400 font-semibold">{r.propertyType?.name}</span>
                        {(r.latitude || r.longitude) && (
                          <a
                            href={`https://maps.google.com/?q=${r.latitude},${r.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-blue-400 hover:underline inline-flex items-center gap-0.5"
                          >
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            {r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{r.wasteType}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {new Date(r.preferredDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : r.status === 'ASSIGNED'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {r.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'ASSIGNED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-all shadow-md"
                        >
                          Dispatch Team
                        </button>
                      )}
                      {r.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'COMPLETED')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg transition-all shadow-md"
                        >
                          Mark Completed
                        </button>
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
