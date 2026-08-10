'use client';

import React from 'react';
import { SCHEMES, PLACES_TO_VISIT } from './data';

interface LowerSectionsProps {
  isHighContrast?: boolean;
}

export const LowerSections: React.FC<LowerSectionsProps> = ({ isHighContrast }) => {
  return (
    <div className="max-w-6xl mx-auto mt-6 px-4 flex flex-col md:flex-row gap-6 mb-8">
      {/* Government Schemes List */}
      <div className="w-full md:w-1/2">
        <div className={`px-3 py-2 text-sm font-bold border-b-2 uppercase flex justify-between items-center ${
          isHighContrast
            ? 'bg-yellow-400 text-black border-yellow-500'
            : 'bg-[#1e3a8a] text-white border-[#f97316]'
        }`}>
          <span>Government Schemes</span>
          <span className="text-[10px] underline cursor-pointer">View All</span>
        </div>
        <div className={`border border-t-0 p-3 ${
          isHighContrast ? 'bg-black border-yellow-400 text-gray-200' : 'bg-white border-gray-300'
        }`}>
          <ul className="space-y-3">
            {SCHEMES.map((scheme, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-3 border-b pb-3 ${
                  idx === SCHEMES.length - 1 ? 'border-b-0 pb-0' : isHighContrast ? 'border-gray-800' : 'border-gray-100'
                }`}
              >
                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center font-bold text-xs text-center border p-1 ${
                  isHighContrast
                    ? 'bg-gray-900 border-yellow-400 text-yellow-400'
                    : 'bg-gray-100 border-gray-300 text-[#1e3a8a]'
                }`}>
                  {scheme.code}
                </div>
                <div>
                  <h4 className={`text-sm font-bold hover:underline cursor-pointer ${
                    isHighContrast ? 'text-yellow-400' : 'text-blue-800'
                  }`}>
                    {scheme.title}
                  </h4>
                  <p className={`text-[12px] mt-1 line-clamp-2 ${
                    isHighContrast ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {scheme.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Places to Visit - Boxed layout */}
      <div className="w-full md:w-1/2">
        <div className={`px-3 py-2 text-sm font-bold border-b-2 uppercase flex justify-between items-center ${
          isHighContrast
            ? 'bg-yellow-400 text-black border-yellow-500'
            : 'bg-[#1e3a8a] text-white border-[#f97316]'
        }`}>
          <span>Places to Visit</span>
          <span className="text-[10px] underline cursor-pointer">View All</span>
        </div>
        <div className={`border border-t-0 p-3 grid grid-cols-2 gap-3 ${
          isHighContrast ? 'bg-black border-yellow-400' : 'bg-white border-gray-300'
        }`}>
          {PLACES_TO_VISIT.map((place, idx) => (
            <div
              key={idx}
              className={`border p-1 cursor-pointer transition-colors ${
                isHighContrast
                  ? 'border-gray-800 hover:border-yellow-400 bg-gray-900'
                  : 'border-gray-300 hover:border-blue-400 bg-white'
              }`}
            >
              <img
                src={place.image}
                alt={place.name}
                className="w-full h-24 object-cover mb-1"
              />
              <h4 className={`text-[12px] font-bold text-center ${
                isHighContrast ? 'text-yellow-300' : 'text-gray-800'
              }`}>
                {place.name}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
