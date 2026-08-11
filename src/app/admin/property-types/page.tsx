'use client';

import React, { useEffect, useState } from 'react';
import { Tags, Plus, CheckCircle2, IndianRupee, Edit3, Save } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function PropertyTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('150');
  const [unit, setUnit] = useState('per_collection');
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const url = editingType
        ? `/api/admin/property-types/${editingType.id}`
        : '/api/admin/property-types';
      const method = editingType ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price, unit }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(editingType ? 'Property category updated!' : 'Property category created!');
        resetForm();
        fetchTypes();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (err) {
      toast.error('Unexpected error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (t: any) => {
    setEditingType(t);
    setName(t.name);
    setDescription(t.description || '');
    setPrice(t.activePrice?.toString() || '150');
    setUnit(t.activeUnit || 'per_collection');
    setShowModal(true);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('150');
    setUnit('per_collection');
    setEditingType(null);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Property Categories & Pricing</h1>
          <p className="text-xs text-slate-400 mt-1">
            Define municipal property classifications and set dynamic collection pricing per property type.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-emerald-950/50"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Grid of Property Types */}
      {loading ? (
        <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Loading municipal property categories & tariff prices...</span>
          </div>
        </div>
      ) : types.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
          No property categories defined yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {types.map((t) => (
            <div
              key={t.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 relative group hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Tags className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-xs flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{t.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description || 'No description provided.'}</p>
                </div>

                {/* Price badge */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" /> Active Tariff:
                  </div>
                  <span className="text-sm font-extrabold text-emerald-400">
                    {formatCurrency(t.activePrice || 0)} <span className="text-[10px] text-slate-400 font-normal">/ {t.activeUnit || 'collection'}</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>{t._count?.properties || 0} Registered Properties</span>
                <span>{t._count?.pricingConfigs || 0} Pricing Revisions</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating / Editing Property Type & Price */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingType ? 'Edit Property Category & Price' : 'Create Property Category'}
              </h2>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
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
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Base Tariff / Fee (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="150"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Billing Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="per_collection">per collection</option>
                  <option value="per_month">per month</option>
                  <option value="per_ton">per metric ton</option>
                </select>
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
                {submitting ? 'Saving...' : editingType ? 'Update Category & Tariff' : 'Save Property Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
