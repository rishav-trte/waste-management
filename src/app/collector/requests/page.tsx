'use client';

import React, { useEffect, useState } from 'react';
import { CollectorNav } from '@/components/shared/CollectorNav';
import { MapPin, Phone, Calendar, CheckCircle2, Clock, Truck, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CollectorWasteRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ASSIGNED' | 'COMPLETED'>('ALL');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portal/waste-requests');
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      } else {
        toast.error('Failed to load waste requests');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/portal/waste-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Request status updated to ${newStatus}`);
        fetchRequests();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Unexpected error updating request');
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* <CollectorNav /> */}

      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-800/80 p-4 border border-slate-700 rounded-xl shadow-md">
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-yellow-400" /> Citizen Pickup Requests
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              On-demand doorstep waste collections requested by citizens.
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-all"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs overflow-x-auto">
          {(['ALL', 'PENDING', 'ASSIGNED', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-all whitespace-nowrap ${
                filter === status
                  ? 'bg-[#f97316] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* List of Requests */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <span className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" />
            <p className="text-xs">Loading citizen pickup queue...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-8 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs font-semibold">No pickup requests found for '{filter}' status.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-3 shadow-lg hover:border-slate-600 transition-all"
              >
                {/* Top Row: User info & Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-700/70 pb-2.5">
                  <div>
                    <h3 className="font-bold text-white text-sm">{req.user?.name || 'Citizen'}</h3>
                    <p className="text-[11px] text-slate-400">{req.user?.email}</p>
                    {req.phone && (
                      <a
                        href={`tel:${req.phone}`}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-0.5 hover:underline"
                      >
                        <Phone className="w-3 h-3" /> {req.phone}
                      </a>
                    )}
                    <p className="text-[11px] text-slate-400 mt-0.5">₹{req.price}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      req.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : req.status === 'ASSIGNED'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-200">{req.address}</span>
                      {req.latitude && req.longitude && (
                        <div className="mt-0.5">
                          <a
                            href={`https://maps.google.com/?q=${req.latitude},${req.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-400 hover:underline inline-flex items-center gap-1"
                          >
                            Open Google Navigation Maps ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="bg-slate-700/60 px-2 py-0.5 rounded text-yellow-300 font-semibold">
                      Category: {req.propertyType?.name || 'General'} ({req.wasteType})
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(req.preferredDate).toLocaleDateString()}
                    </span>
                  </div>

                  {req.notes && (
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-700/40 text-[11px] text-slate-300 italic">
                      " {req.notes} "
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-2 border-t border-slate-700/70 flex gap-2">
                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'ASSIGNED')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all shadow-md"
                    >
                      <Clock className="w-3.5 h-3.5" /> Accept Request
                    </button>
                  )}

                  {req.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Pickup Completed
                    </button>
                  )}

                  {req.status === 'COMPLETED' && (
                    <div className="w-full py-1.5 text-center text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pickup Fulfilled
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
