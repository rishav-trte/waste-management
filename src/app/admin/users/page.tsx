'use client';

import React, { useEffect, useState } from 'react';
import { Users, UserPlus, ShieldCheck, Search, Edit3, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('COLLECTOR');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || (!editingUser && !password)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const url = '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';
      const bodyPayload = editingUser
        ? { id: editingUser.id, name, role, ...(password && { password }), vehicleType, vehicleNumber }
        : { name, email, password, role, vehicleType, vehicleNumber };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editingUser ? 'User role updated!' : 'New user account created!');
        resetForm();
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to save user');
      }
    } catch (err) {
      toast.error('Unexpected error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setVehicleType(u.vehicleType || '');
    setVehicleNumber(u.vehicleNumber || '');
    setShowModal(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('COLLECTOR');
    setVehicleType('');
    setVehicleNumber('');
    setEditingUser(null);
    setShowModal(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole ? u.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'COMMISSIONER':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'SUB_ADMIN':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'ADMIN':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'COLLECTOR':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" /> Municipal User & RBAC Role Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Manage user accounts, assign RBAC roles (Commissioner, Sub Admin, Field Collector, Citizen), and issue access credentials.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-emerald-950/50"
        >
          <UserPlus className="w-4 h-4" /> Create User Account
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="">All Roles</option>
          <option value="COMMISSIONER">Commissioner (Superadmin)</option>
          <option value="SUB_ADMIN">Sub Admin Operations</option>
          <option value="ADMIN">System Administrator</option>
          <option value="COLLECTOR">Field Collector</option>
          <option value="USER">Citizen User</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-100 dark:bg-slate-950/80 text-gray-500 dark:text-slate-400 font-semibold border-b border-gray-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">User Officer</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Assigned RBAC Role</th>
                <th className="py-3.5 px-4">Account Joined</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800/60 text-gray-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <LoadingSpinner size="md" label="Loading municipal user directory & RBAC profiles..." />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-slate-500">
                    No user accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-100 dark:bg-gray-50 dark:bg-slate-800/30 transition-all">
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 text-emerald-400 border border-gray-300 dark:border-slate-700 flex items-center justify-center text-xs font-extrabold">
                        {u.name[0]?.toUpperCase()}
                      </div>
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-700 dark:text-slate-300">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                      {u.role === 'COLLECTOR' && (u.vehicleType || u.vehicleNumber) && (
                        <div className="mt-1 text-[10px] text-gray-500 dark:text-slate-400 font-mono">
                          🚐 {u.vehicleType || 'Vehicle'} {u.vehicleNumber ? `(${u.vehicleNumber})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-slate-700 text-gray-800 dark:text-slate-200 hover:text-gray-900 dark:text-white font-semibold text-[11px] rounded-lg transition-all border border-gray-300 dark:border-slate-700 inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Role
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating / Editing User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-100 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingUser ? 'Edit User Account & Role' : 'Create Municipal User Account'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white text-xs font-semibold">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  placeholder="officer@wastemgmt.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  {editingUser ? 'New Password (leave blank to keep existing)' : 'Account Password'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Assigned RBAC Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="COMMISSIONER">Commissioner (Superadmin)</option>
                  <option value="SUB_ADMIN">Sub Admin Operations</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="COLLECTOR">Field Collector</option>
                  <option value="USER">Citizen User</option>
                </select>
              </div>

              {role === 'COLLECTOR' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-50 dark:bg-slate-950/50 border border-gray-200 dark:border-slate-800 rounded-xl">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Vehicle Type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      <option value="">Select Type</option>
                      <option value="Mini Truck">Mini Truck</option>
                      <option value="E-Rickshaw">E-Rickshaw</option>
                      <option value="Auto Rickshaw">Auto Rickshaw</option>
                      <option value="Tractor">Tractor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Vehicle Number</label>
                    <input
                      type="text"
                      placeholder="e.g. DD-03-AB-1234"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 uppercase"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <LoadingSpinner size="sm" label="Saving User..." />
                ) : editingUser ? (
                  'Update User Role'
                ) : (
                  'Create User Account'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
