'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Building2, Plus, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const PropertyMapClient = dynamic(
  () => import('@/components/admin/PropertyMapClient'),
  { ssr: false, loading: () => <div className="h-64 w-full bg-slate-900 rounded-2xl animate-pulse flex items-center justify-center text-slate-500 text-xs">Loading GIS Map...</div> }
);

export default function PropertiesRegistryPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [phone, setPhone] = useState('');
  const [latitude, setLatitude] = useState('28.6139');
  const [longitude, setLongitude] = useState('77.2090');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProps, resTypes] = await Promise.all([
        fetch('/api/admin/properties'),
        fetch('/api/admin/property-types'),
      ]);
      const jsonProps = await resProps.json();
      const jsonTypes = await resTypes.json();

      setProperties(jsonProps.properties || []);
      setPropertyTypes(jsonTypes.propertyTypes || []);
      if (jsonTypes.propertyTypes?.length > 0) {
        setPropertyTypeId(jsonTypes.propertyTypes[0].id);
      }
    } catch (err) {
      toast.error('Failed to load property registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !address || !propertyTypeId) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerName, address, propertyTypeId, phone, latitude, longitude }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Property registered successfully!');
        setOwnerName('');
        setAddress('');
        setPhone('');
        setShowModal(false);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to register property');
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Property Registry & Spatial GIS</h1>
          <p className="text-xs text-slate-400 mt-1">
            Register and manage municipal properties tagged with PostGIS spatial coordinates.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-emerald-950/50"
        >
          <Plus className="w-4 h-4" /> Register New Property
        </button>
      </div>

      {/* GIS Spatial Map */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" /> Live GIS Spatial Location Overlay
        </h2>
        <PropertyMapClient properties={properties} />
      </div>

      {/* Property List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {properties.map((p) => (
          <div key={p.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-emerald-400 border border-slate-700">
                {p.propertyType?.name || 'Property'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{p.ownerName}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.address}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> {p.phone || 'No phone recorded'}
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Registering Property */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Register Municipal Property</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Owner / Establishment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Retail Solutions"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Address</label>
                <input
                  type="text"
                  required
                  placeholder="Plot #, Street, Ward / District"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Property Category</label>
                  <select
                    value={propertyTypeId}
                    onChange={(e) => setPropertyTypeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    {propertyTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Registering...' : 'Register Property'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
