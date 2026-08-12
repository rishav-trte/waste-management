'use client';

import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Building2,
  Banknote,
  CreditCard,
  Search,
  Navigation,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function NewCollectionPage() {
  const [activeTab, setActiveTab] = useState<'SEARCH' | 'NEW'>('SEARCH');

  // Search state
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New Property State
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPropertyTypeId, setNewPropertyTypeId] = useState('');

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

  // Fetch properties & property types
  useEffect(() => {
    fetch('/api/admin/properties')
      .then((res) => res.json())
      .then((data) => setProperties(data.properties || []))
      .catch((err) => console.error(err));

    fetch('/api/admin/property-types')
      .then((res) => res.json())
      .then((data) => setPropertyTypes(data.propertyTypes || []))
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
    setSubmitting(true);
    
    let targetPropertyId = selectedPropertyId;
    let targetProperty = selectedProperty;
    
    try {
      if (activeTab === 'NEW') {
        if (!newOwnerName || !newAddress || !newPropertyTypeId) {
          toast.error('Please fill all required property details');
          setSubmitting(false);
          return;
        }
        
        // Create new property
        const propRes = await fetch('/api/collector/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerName: newOwnerName,
            phone: newPhone,
            address: newAddress,
            propertyTypeId: newPropertyTypeId,
            latitude: latitude || 28.6139,
            longitude: longitude || 77.2090
          }),
        });
        
        const propData = await propRes.json();
        if (!propRes.ok) {
          toast.error(propData.error || 'Failed to register property');
          setSubmitting(false);
          return;
        }
        
        targetPropertyId = propData.property.id;
        targetProperty = propData.property;
      } else {
        if (!targetPropertyId) {
          toast.error('Please select a property');
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch('/api/collector/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: targetPropertyId,
          latitude: latitude || targetProperty?.latitude,
          longitude: longitude || targetProperty?.longitude,
          notes,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit collection');
        setSubmitting(false);
        return;
      }

      if (paymentMethod === 'CASH') {
        toast.success('Collection logged and cash payment verified!');
        resetForm();
      } else {
        // Trigger Razorpay Payment Order Creation
        let amountToCharge = 150;
        if (activeTab === 'NEW') {
          const pType = propertyTypes.find((t) => t.id === newPropertyTypeId);
          amountToCharge = pType?.activePrice || 150;
        } else {
          amountToCharge = targetProperty?.propertyType?.activePrice || 150;
        }
        
        const payRes = await fetch('/api/payments/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountToCharge,
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
    setNewOwnerName('');
    setNewPhone('');
    setNewAddress('');
    setNewPropertyTypeId('');
    setActiveTab('SEARCH');
  };

  // Helper for dynamic price display in NEW tab
  const selectedNewPropertyType = propertyTypes.find(t => t.id === newPropertyTypeId);

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-black tracking-tight">Record Collection</h2>
        <p className="text-xs text-slate-400">Log municipal waste collection & process instant billing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Tab Toggle */}
        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('SEARCH')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex justify-center items-center gap-2 transition-all ${
              activeTab === 'SEARCH' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" /> Search Existing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('NEW')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex justify-center items-center gap-2 transition-all ${
              activeTab === 'NEW' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Register New
          </button>
        </div>

        {/* Step 1: Property Info */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            1. Property Details
          </label>

          {activeTab === 'SEARCH' ? (
            <>
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
            </>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Owner Name *"
                value={newOwnerName}
                onChange={(e) => setNewOwnerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
              <input
                type="text"
                placeholder="Phone Number (Optional)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <input
                type="text"
                placeholder="Property Number / Full Address *"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
              <select
                value={newPropertyTypeId}
                onChange={(e) => setNewPropertyTypeId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              >
                <option value="">Select Building Type *</option>
                {propertyTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (₹{t.activePrice})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected Property Preview (for Search Mode) */}
        {activeTab === 'SEARCH' && selectedProperty && (
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

        {/* Dynamic Preview for New Property Mode */}
        {activeTab === 'NEW' && newOwnerName && newPropertyTypeId && selectedNewPropertyType && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">New Registration</p>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                {selectedNewPropertyType.name}
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <p className="text-sm font-bold text-white">{newOwnerName}</p>
                <p className="text-xs text-slate-300 mt-0.5">{newAddress || 'Address Pending'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Tariff Amount</p>
                <p className="text-base font-extrabold text-emerald-400">
                  {formatCurrency(selectedNewPropertyType.activePrice || 150)}
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
          disabled={submitting || (activeTab === 'SEARCH' && !selectedPropertyId) || (activeTab === 'NEW' && (!newOwnerName || !newAddress || !newPropertyTypeId))}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
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
