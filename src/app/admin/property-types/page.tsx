'use client';

import React, { useEffect, useState } from 'react';
import { Tags, Plus, RefreshCw, CheckCircle2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function PropertyTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/property-types');
      const data = await res.json();
      setTypes(data.propertyTypes || []);
    } catch (err) {
      toast.error('Failed to load property types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/property-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Property category created!');
        setName('');
        setDescription('');
        setShowModal(false);
        fetchTypes();
      } else {
        toast.error(data.error || 'Failed to create');
      }
    } catch (err) {
      toast.error('Unexpected error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Property Categories</h1>
          <p className="text-xs text-slate-400 mt-1">
            Define municipal property classifications used for tariff calculations and route planning.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-emerald-950/50"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Grid of Property Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {types.map((t) => (
          <div key={t.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 relative group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Tags className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{t.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description || 'No description provided.'}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{t._count?.properties || 0} Registered Properties</span>
              <span>{t._count?.pricingConfigs || 0} Price Models</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Creating Property Type */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create Property Category</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial, Healthcare, Institutional"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of waste type and collection guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Saving...' : 'Save Property Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
