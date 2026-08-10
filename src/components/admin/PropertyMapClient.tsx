'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

interface PropertyItem {
  id: string;
  ownerName: string;
  address: string;
  latitude: number;
  longitude: number;
  propertyType?: { name: string };
}

export default function PropertyMapClient({ properties }: { properties: PropertyItem[] }) {
  useEffect(() => {
    // Fix default marker icon issues in Leaflet Webpack/Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  const defaultCenter: [number, number] =
    properties.length > 0 ? [properties[0].latitude, properties[0].longitude] : [28.6139, 77.2090];

  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((prop) => (
          <Marker
            key={prop.id}
            position={[prop.latitude, prop.longitude]}
            icon={createCustomIcon('#10b981')}
          >
            <Popup>
              <div className="text-slate-900 p-1 text-xs">
                <p className="font-bold text-sm">{prop.ownerName}</p>
                <p className="text-slate-600">{prop.address}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                  {prop.propertyType?.name || 'Property'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
