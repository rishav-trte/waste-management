'use client';

import React, { useEffect, useState } from 'react';
import { Truck, Calendar, MapPin, Layers, CheckCircle2, ArrowRight, ShieldCheck, Navigation, LogOut, CreditCard, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { MunicipalPortalHeader } from '@/components/municipal/MunicipalPortalHeader';
import { formatCurrency } from '@/lib/utils';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CitizenRequestPage() {
  const { data: session } = useSession();
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [wasteCategories, setWasteCategories] = useState<any[]>([]);
  const [wasteType, setWasteType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetch('/api/admin/property-types')
      .then((res) => res.json())
      .then((data) => {
        const types = data.propertyTypes || [];
        setPropertyTypes(types);
        if (types.length > 0) setPropertyTypeId(types[0].id);
      });

    fetch('/api/admin/waste-categories')
      .then((res) => res.json())
      .then((data) => {
        const activeCategories = (data.categories || []).filter((c: any) => c.isActive);
        setWasteCategories(activeCategories);
        if (activeCategories.length > 0) setWasteType(activeCategories[0].name);
      });

    fetchRequests();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
        toast.success('GPS coordinates locked successfully!');
      },
      (err) => {
        console.warn('GPS error, using default coordinates:', err);
        setLatitude('28.613900');
        setLongitude('77.209000');
        setGpsLoading(false);
        toast.info('GPS fallback coordinates applied');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

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

    if (phone && !/^\+?[0-9\s\-\(\)]{10,15}$/.test(phone)) {
      toast.error('Please enter a valid 10-15 digit phone number');
      return;
    }

    if (latitude || longitude) {
      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        toast.error('Please enter a valid latitude between -90 and 90');
        return;
      }
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        toast.error('Please enter a valid longitude between -180 and 180');
        return;
      }
    }

    setSubmitting(true);
    try {
      const pType = propertyTypes.find((t) => t.id === propertyTypeId);
      const amountToCharge = pType?.activePrice || 150;

      const payRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountToCharge,
        }),
      });

      const payOrder = await payRes.json();

      if (payRes.ok) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Razorpay SDK failed to load');
          return;
        }

        const options = {
          key: payOrder.key,
          amount: payOrder.amount,
          currency: payOrder.currency,
          name: 'Waste Management',
          description: 'Waste Collection Payment',
          order_id: payOrder.orderId,
          handler: async function (response: any) {
            setProcessingPayment(true);
            try {
              const verifyRes = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              if (verifyRes.ok) {
                const createRes = await fetch('/api/portal/waste-requests', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    phone,
                    address,
                    latitude,
                    longitude,
                    propertyTypeId,
                    wasteType,
                    preferredDate,
                    notes,
                    razorpayOrderId: response.razorpay_order_id,
                  }),
                });

                if (createRes.ok) {
                  toast.success('Payment successful & Request Scheduled!');
                  setPhone('');
                  setAddress('');
                  setLatitude('');
                  setLongitude('');
                  setNotes('');
                  fetchRequests();
                } else {
                  toast.error('Payment succeeded but request creation failed.');
                }
              } else {
                toast.error('Payment confirmation failed');
              }
            } catch (err) {
              toast.error('Payment gateway timeout');
            } finally {
              setProcessingPayment(false);
            }
          },
          prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
            contact: phone,
          },
          theme: {
            color: '#10b981',
          },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
          toast.error('Payment failed: ' + response.error.description);
        });
        paymentObject.open();

      } else {
        toast.error('Failed to initialize payment.');
      }
    } catch (err) {
      toast.error('An error occurred during payment initialization');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this pickup request?')) return;

    try {
      const res = await fetch('/api/portal/waste-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'CANCELLED' }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Pickup request cancelled');
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to cancel request');
      }
    } catch (err) {
      toast.error('An error occurred during cancellation');
    }
  };

  const handlePayNow = async (request: any) => {
    try {
      const pType = request.propertyType;
      const amountToCharge = pType?.activePrice || 150;

      const payRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountToCharge,
          wasteRequestId: request.id,
        }),
      });
      const payOrder = await payRes.json();

      if (payRes.ok) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Razorpay SDK failed to load');
          return;
        }

        const options = {
          key: payOrder.key,
          amount: payOrder.amount,
          currency: payOrder.currency,
          name: 'Waste Management',
          description: 'Waste Collection Payment',
          order_id: payOrder.orderId,
          handler: async function (response: any) {
            setProcessingPayment(true);
            try {
              const verifyRes = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  wasteRequestId: request.id,
                }),
              });

              if (verifyRes.ok) {
                toast.success('Razorpay Payment Processed & Confirmed!');
                fetchRequests();
              } else {
                toast.error('Payment confirmation failed');
              }
            } catch (err) {
              toast.error('Payment gateway timeout');
            } finally {
              setProcessingPayment(false);
            }
          },
          prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
            contact: request.phone || '',
          },
          theme: {
            color: '#10b981',
          },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
          toast.error('Payment failed: ' + response.error.description);
        });
        paymentObject.open();
      }
    } catch (payErr) {
      toast.error('Failed to initialize payment.');
    }
  };

  const todayDateStr = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <MunicipalPortalHeader
        portalTitle="Citizen Municipal Portal"
        portalSubtitle="On-Demand Waste Pickup Request"
      />

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Schedule Pickup</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Schedule doorstep waste collection with GPS coordinates for precise collection team routing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Request Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" /> Schedule Pickup Slot & Coordinates
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={15}
                pattern="^\+?[0-9\s\-\(\)]{10,15}$"
                title="Phone number must be between 10 and 15 digits"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Property Location / Address *</label>
              <textarea
                required
                rows={2}
                placeholder="Full premises address, landmark, building name..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* GPS Coordinates & Autodetect */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" /> GIS Coordinates (Lat / Long)
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={gpsLoading}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-3 py-1 rounded-lg font-semibold transition-all"
                >
                  <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                  {gpsLoading ? 'Locating...' : 'Detect Current GPS'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    placeholder="e.g. 28.61393"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    placeholder="e.g. 77.20902"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
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
                  min={todayDateStr}
                  max={maxDateStr}
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
                    onClick={() => setWasteType(c.name)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${wasteType === c.name
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                  >
                    <div className="text-base mb-1">{c.icon}</div>
                    <span className="font-bold text-[11px] block">{c.name}</span>
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

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
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
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'COMPLETED'
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
                    {(r.latitude || r.longitude) && (
                      <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {r.latitude?.toFixed(5)}, {r.longitude?.toFixed(5)}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                      <span>Date: {new Date(r.preferredDate).toLocaleDateString()}</span>
                      <div className="flex items-center gap-3">
                        <span>Category: {r.propertyType?.name}</span>
                        {r.status === 'PENDING' && (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handlePayNow(r)}
                              className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" /> Pay Now
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancel(r.id)}
                              className="text-red-400 hover:text-red-300 font-bold hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
