'use client';

import React, { useEffect, useState } from 'react';
import { Truck, Calendar, MapPin, Layers, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const wasteCategories = [
  { id: 'Dry & Recyclable', label: 'Dry & Recyclables', icon: '♻️', desc: 'Paper, cardboard, plastic bottles, glass' },
  { id: 'Wet & Organic', label: 'Wet / Organic Food Waste', icon: '🥬', desc: 'Kitchen scraps, garden waste, compostables' },
  { id: 'Hazardous / E-Waste', label: 'E-Waste & Bio-Hazardous', icon: '🔋', desc: 'Batteries, electronics, medical items' },
  { id: 'Bulk / Debris', label: 'Bulk Construction Debris', icon: '🏗️', desc: 'Furniture, renovation rubble, trees' },
];

export default function CitizenRequestPage() {
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [wasteType, setWasteType] = useState('Dry & Recyclable');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/property-types')
      .then((res) => res.json())
      .then((data) => {
        const types = data.propertyTypes || [];
        setPropertyTypes(types);
        if (types.length > 0) setPropertyTypeId(types[0].id);
      });

    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/portal/waste-requests');
      const data = await res.json();
      setMyRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !propertyTypeId || !preferredDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/portal/waste-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, propertyTypeId, wasteType, preferredDate, notes }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('On-demand waste pickup scheduled!');
        setAddress('');
        setNotes('');
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('An error occurred during submission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 border border-blue-800 rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-xs font-bold border border-yellow-400/30">
          <Truck className="w-4 h-4" /> Citizen Municipal Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">On-Demand Waste Pickup Request</h1>
        <p className="text-xs sm:text-sm text-blue-200 max-w-xl leading-relaxed">
          Schedule special doorstep waste collection for residential, commercial, or industrial premises across the municipality.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Request Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" /> Schedule Pickup Slot
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Property Location / Address</label>
            <textarea
              required
              rows={2}
              placeholder="Full premises address, landmark, building name..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Property Category</label>
              <select
                value={propertyTypeId}
                onChange={(e) => setPropertyTypeId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {propertyTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (₹{t.activePrice || 150})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Preferred Date</label>
              <input
                type="date"
                required
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Waste Category</label>
            <div className="grid grid-cols-2 gap-2.5">
              {wasteCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setWasteType(c.id)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                    wasteType === c.id
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-base mb-1">{c.icon}</div>
                  <span className="font-bold text-[11px] block">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Special Instructions (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Call before arrival, gate access code..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? 'Scheduling Request...' : 'Confirm Pickup Request'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Existing Requests Track Board */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> My Scheduled Pickups
          </h2>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {myRequests.length === 0 ? (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                No active pickup requests logged yet.
              </div>
            ) : (
              myRequests.map((r) => (
                <div key={r.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{r.wasteType}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : r.status === 'ASSIGNED'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-slate-400 truncate">{r.address}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                    <span>Date: {new Date(r.preferredDate).toLocaleDateString()}</span>
                    <span>Category: {r.propertyType?.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
