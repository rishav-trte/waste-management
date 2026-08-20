'use client';

import React, { useEffect, useState } from 'react';
import { Receipt, Plus, CheckCircle2, History, IndianRupee } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function PricingConfigPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('per_month');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resConfigs, resTypes] = await Promise.all([
        fetch('/api/admin/pricing'),
        fetch('/api/admin/property-types'),
      ]);
      const jsonConfigs = await resConfigs.json();
      const jsonTypes = await resTypes.json();

      setConfigs(jsonConfigs.pricingConfigs || []);
      setPropertyTypes(jsonTypes.propertyTypes || []);
      if (jsonTypes.propertyTypes?.length > 0) {
        setPropertyTypeId(jsonTypes.propertyTypes[0].id);
      }
    } catch (err) {
      toast.error('Failed to load pricing configs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !propertyTypeId) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyTypeId, price, unit, effectiveFrom }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('New tariff rule created successfully!');
        setPrice('');
        setShowModal(false);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to create tariff rule');
      }
    } catch (err) {
      toast.error('Unexpected error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-emerald-500" /> Tariff & Pricing Configurations
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Configure dynamic waste collection rates with effective date range auditing for government compliance.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-emerald-950/50"
        >
          <Plus className="w-4 h-4" /> Create New Tariff Rule
        </button>
      </div>

      {/* Pricing Cards Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" /> Active & Historical Pricing Audit Log
          </h2>
          <span className="text-xs text-gray-500 dark:text-slate-400">{configs.length} Rules Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-950/60 text-gray-500 dark:text-slate-400 uppercase font-semibold border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Property Category</th>
                <th className="py-3 px-4">Tariff Price</th>
                <th className="py-3 px-4">Billing Unit</th>
                <th className="py-3 px-4">Effective Date Range</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800/60 text-gray-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <LoadingSpinner size="md" label="Loading tariff & pricing configurations..." />
                  </td>
                </tr>
              ) : configs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-slate-500">
                    No pricing configurations created yet.
                  </td>
                </tr>
              ) : (
                configs.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-100 dark:bg-slate-800/40 transition-all">
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">{c.propertyType?.name}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400 text-sm">
                      {formatCurrency(c.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-md font-medium text-[11px]">
                        {c.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 dark:text-slate-400">
                      {formatDate(c.effectiveFrom)} → {c.effectiveTo ? formatDate(c.effectiveTo) : 'Present (Active)'}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 rounded-full font-semibold text-[10px]">
                          <History className="w-3 h-3" /> ARCHIVED
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

      {/* Modal for Creating Tariff Rule */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-100 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Tariff Configuration</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Property Category</label>
                <select
                  value={propertyTypeId}
                  onChange={(e) => setPropertyTypeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {propertyTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Price (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Billing Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="per_month">per_month</option>
                    <option value="per_collection">per_collection</option>
                    <option value="per_kg">per_kg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Effective From Date</label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Creating Tariff...' : 'Activate New Tariff'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
