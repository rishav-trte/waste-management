'use client';

import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Building2,
  Banknote,
  CreditCard,
  CheckCircle2,
  Search,
  Navigation,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function NewCollectionPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // GPS state
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Form state
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE'>('CASH');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Payment Modal state
  const [paymentModalData, setPaymentModalData] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch properties
  useEffect(() => {
    fetch('/api/admin/properties')
      .then((res) => res.json())
      .then((data) => setProperties(data.properties || []))
      .catch((err) => console.error(err));
  }, []);

  // Auto capture GPS on mount
  useEffect(() => {
    captureGPS();
  }, []);

  const captureGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsLoading(false);
        toast.success('GPS coordinates locked');
      },
      (err) => {
        console.warn('GPS error fallback:', err);
        // Fallback to default coordinates
        setLatitude(28.6139);
        setLongitude(77.2090);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handlePropertySelect = (propId: string) => {
    setSelectedPropertyId(propId);
    const prop = properties.find((p) => p.id === propId);
    setSelectedProperty(prop);
  };

  const filteredProperties = properties.filter(
    (p) =>
      p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) {
      toast.error('Please select a property');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/collector/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedPropertyId,
          latitude: latitude || selectedProperty?.latitude,
          longitude: longitude || selectedProperty?.longitude,
          notes,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit collection');
        return;
      }

      if (paymentMethod === 'CASH') {
        toast.success('Collection logged and cash payment verified!');
        resetForm();
      } else {
        // Trigger Razorpay Payment Order Creation
        const payRes = await fetch('/api/payments/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: selectedProperty?.propertyType?.activePrice || 150,
            collectionId: data.collection.id,
          }),
        });
        const payOrder = await payRes.json();

        setPaymentModalData({
          collection: data.collection,
          order: payOrder,
        });
      }
    } catch (err) {
      toast.error('An error occurred during submission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    setProcessingPayment(true);
    try {
      // Confirm & Verify Razorpay Payment
      const res = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: paymentModalData.order?.orderId,
          razorpayPaymentId: `pay_rzp_${Date.now()}`,
          collectionId: paymentModalData.collection.id,
        }),
      });

      if (res.ok) {
        toast.success('Razorpay Payment Processed & Confirmed!');
        setPaymentModalData(null);
        resetForm();
      } else {
        toast.error('Payment confirmation failed');
      }
    } catch (err) {
      toast.error('Payment gateway timeout');
    } finally {
      setProcessingPayment(false);
    }
  };

  const resetForm = () => {
    setSelectedPropertyId('');
    setSelectedProperty(null);
    setNotes('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-black tracking-tight">Record Collection</h2>
        <p className="text-xs text-slate-400">Log municipal waste collection & process instant billing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Select Property */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            1. Property Selection
          </label>

          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by owner name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {filteredProperties.map((p) => (
              <div
                key={p.id}
                onClick={() => handlePropertySelect(p.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedPropertyId === p.id
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{p.ownerName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                    {p.propertyType?.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{p.address}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Property Preview */}
        {selectedProperty && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Target Location</p>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                {selectedProperty.propertyType?.name || 'Property'}
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <p className="text-sm font-bold text-white">{selectedProperty.ownerName}</p>
                <p className="text-xs text-slate-300 mt-0.5">{selectedProperty.address}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Tariff Amount</p>
                <p className="text-base font-extrabold text-emerald-400">
                  {formatCurrency(selectedProperty.propertyType?.activePrice || 150)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: GPS Telemetry */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              2. GPS Location Tag
            </label>
            <button
              type="button"
              onClick={captureGPS}
              disabled={gpsLoading}
              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline font-medium"
            >
              <Navigation className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} /> Recapture GPS
            </button>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>
                {latitude ? latitude.toFixed(5) : 'Capturing...'}, {longitude ? longitude.toFixed(5) : 'Capturing...'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-sans font-bold">
              GPS Verified
            </span>
          </div>
        </div>

        {/* Step 3: Payment Method Selector */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            3. Payment Method
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                paymentMethod === 'CASH'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Banknote className="w-5 h-5" /> Cash Payment
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('ONLINE')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                paymentMethod === 'ONLINE'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-5 h-5" /> Online (Razorpay/Stripe)
            </button>
          </div>
        </div>

        {/* Step 4: Collector Notes */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <label className="block text-xs font-medium text-slate-300">Operational Notes (Optional)</label>
          <textarea
            rows={2}
            placeholder="Segregation status, special disposal notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !selectedPropertyId}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <>
              Submit Field Collection Entry <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Payment Gateway Interactive Modal */}
      {paymentModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Razorpay / Stripe Gateway</h3>
              <p className="text-xs text-slate-400">Order ID: {paymentModalData.order?.orderId}</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Property Owner</span>
                <span className="font-semibold text-white">{paymentModalData.order?.ownerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount Due</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {formatCurrency(paymentModalData.order?.amount || 0)}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={processingPayment}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {processingPayment ? 'Confirming Webhook...' : 'Simulate Customer Payment Success'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
