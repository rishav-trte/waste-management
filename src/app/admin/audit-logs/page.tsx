'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, History, Search, RefreshCw, UserCheck, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = filterAction ? `/api/admin/audit-logs?action=${filterAction}` : '/api/admin/audit-logs';
      const res = await fetch(url);
      const data = await res.json();
      setLogs(data.auditLogs || []);
    } catch (err) {
      toast.error('Failed to load audit trail logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const filteredLogs = logs.filter(
    (l) =>
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.userName && l.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.userEmail && l.userEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-yellow-400" /> Municipal Audit Trail & Change Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit logging of all property creations, tariff price modifications, bulk imports, and system entries.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all border border-slate-700 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search log entries by user, email, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="">All Audit Actions</option>
          <option value="CREATE_PROPERTY">Create Property</option>
          <option value="CREATE_PROPERTY_TYPE">Create Property Category</option>
          <option value="UPDATE_PROPERTY_TYPE">Update Category Tariff</option>
          <option value="EXCEL_BULK_IMPORT">Excel Bulk Import</option>
          <option value="LOG_COLLECTION">Field Collection</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User Officer</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Action Type</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No audit log entries recorded.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {l.userName || l.userEmail || 'System'}
                      <div className="text-[10px] text-slate-500 font-normal">{l.userEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {l.role || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-yellow-400 font-mono text-[11px]">
                      {l.action}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">{l.entity}</td>
                    <td className="py-3.5 px-4 max-w-md leading-relaxed text-slate-300">
                      {l.details}
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
