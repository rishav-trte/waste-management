'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  IndianRupee,
  Package,
  Building2,
  Users,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Dynamically import Leaflet map (SSR disabled)
const PropertyMapClient = dynamic(
  () => import('@/components/admin/PropertyMapClient'),
  { ssr: false, loading: () => <div className="h-80 w-full bg-slate-900 rounded-2xl animate-pulse flex items-center justify-center text-slate-500 text-xs">Loading GIS Spatial Map...</div> }
);

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const [resMetrics, resProps] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/properties'),
      ]);
      const jsonMetrics = await resMetrics.json();
      const jsonProps = await resProps.json();

      setData(jsonMetrics);
      setProperties(jsonProps.properties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive Operations Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time municipal waste collection statistics, spatial telemetry, and dynamic tariff audit logs.
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Revenue Collected</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {formatCurrency(data?.metrics?.totalRevenue || 0)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> 100% verified settlement
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Collection Logs</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {data?.metrics?.totalCollections || 0}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {data?.metrics?.paidCount || 0} paid, {(data?.metrics?.totalCollections || 0) - (data?.metrics?.paidCount || 0)} pending
          </p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Registered Properties</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {data?.metrics?.activeProperties || 0}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">GIS spatial points mapped</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Field Officers</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {data?.metrics?.totalCollectors || 0}
          </p>
          <p className="text-[11px] text-purple-400 font-medium">Role-gated collector accounts</p>
        </div>
      </div>

      {/* Main Content Grid: Charts + GIS Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Collections by Property Type */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white">Collections Breakdown by Property Category</h2>
          <div className="h-64 w-full">
            {data?.pieChartData && data.pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {data.pieChartData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">No breakdown data available</div>
            )}
          </div>
        </div>

        {/* Leaflet GIS Map */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Live GIS Spatial Point Clustering</h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PostGIS Point Coordinates
            </span>
          </div>
          <PropertyMapClient properties={properties} />
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white">Recent Field Collection Entries</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Property & Address</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Officer</th>
                <th className="py-3 px-4">Tariff Charged</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Collected At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data?.recentCollections?.map((col: any) => (
                <tr key={col.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="py-3.5 px-4 font-medium text-white">
                    <p className="font-bold text-slate-100">{col.property?.ownerName}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{col.property?.address}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md font-medium text-[11px]">
                      {col.property?.propertyType?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{col.collector?.name}</td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-400">
                    {formatCurrency(col.amountCharged)}
                  </td>
                  <td className="py-3.5 px-4">
                    {col.paymentStatus === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-semibold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-semibold text-[10px]">
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
      </div>
    </div>
  );
}
