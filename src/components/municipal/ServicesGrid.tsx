'use client';

import React from 'react';
import { CITIZEN_SERVICES } from './data';

interface ServicesGridProps {
  isHighContrast?: boolean;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ isHighContrast }) => {
  return (
    <div className={`border-y py-6 mt-6 ${
      isHighContrast ? 'bg-black border-yellow-400' : 'bg-gray-100 border-gray-300'
    }`}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className={`text-center text-xl font-bold mb-6 uppercase tracking-wide border-b pb-2 ${
          isHighContrast
            ? 'text-yellow-400 border-yellow-400'
            : 'text-[#1e3a8a] border-gray-300'
        }`}>
          Citizen Services
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CITIZEN_SERVICES.map((srv, idx) => (
            <a
              key={idx}
              href={srv.href || '#'}
              className={`border p-4 text-center shadow-sm transition-all group ${
                isHighContrast
                  ? 'bg-gray-900 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                  : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400'
              }`}
            >
              <div className="text-3xl mb-2 grayscale group-hover:grayscale-0 transition-all">
                {srv.icon}
              </div>
              <h3 className={`text-[12px] font-bold uppercase transition-colors ${
                isHighContrast
                  ? 'text-yellow-300 group-hover:text-black'
                  : 'text-gray-800 group-hover:text-[#1e3a8a]'
              }`}>
                {srv.title}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
