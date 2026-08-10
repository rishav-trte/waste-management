'use client';

import React from 'react';
import { CITY_STATISTICS, PORTAL_TITLE } from './data';

interface InformationSectionProps {
  isHighContrast?: boolean;
}

export const InformationSection: React.FC<InformationSectionProps> = ({ isHighContrast }) => {
  return (
    <div className="max-w-6xl mx-auto mt-6 px-4 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-2/3">
        <h2
          className={`text-xl font-bold border-b-2 pb-1 mb-3 ${
            isHighContrast
              ? 'text-yellow-400 border-yellow-400'
              : 'text-[#1e3a8a] border-[#1e3a8a]'
          }`}
          style={{ fontFamily: 'Georgia, serif' }}
        >
          About {PORTAL_TITLE}
        </h2>
        <div className={`p-4 border shadow-sm text-sm leading-relaxed text-justify ${
          isHighContrast ? 'bg-black border-yellow-400 text-gray-200' : 'bg-white border-gray-300 text-gray-800'
        }`}>
          <img
            src="https://placehold.co/200x150/e2e8f0/1e3a8a?text=Building"
            alt="HQ Building"
            className="float-left mr-4 mb-2 border border-gray-400 p-1 bg-gray-50"
          />
          <p className="mb-3">
            The {PORTAL_TITLE} is dedicated to serving citizens by providing modern civic waste operations, real-time collector tracking, dynamic tariff auditing, and planned environmental development across the municipal region.
          </p>
          <p>
            Equipped with real-time GIS spatial telemetry and digital property billing, the council maintains high sanitation standards, segregated door-to-door collections, recycling initiatives, and immediate complaint redressal to enhance public health and environmental sustainability.
          </p>
          <div className="mt-4 text-right">
            <a
              href="#"
              className={`font-semibold hover:underline text-[13px] ${
                isHighContrast ? 'text-yellow-400' : 'text-blue-700'
              }`}
            >
              Read More »
            </a>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/3">
        <h2
          className={`text-xl font-bold border-b-2 pb-1 mb-3 ${
            isHighContrast
              ? 'text-yellow-400 border-yellow-400'
              : 'text-[#1e3a8a] border-[#1e3a8a]'
          }`}
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Municipal Statistics
        </h2>
        {/* Table-like layout for data presentation */}
        <div className={`border shadow-sm ${isHighContrast ? 'bg-black border-yellow-400' : 'bg-white border-gray-300'}`}>
          <ul className={`divide-y ${isHighContrast ? 'divide-gray-800' : 'divide-gray-200'}`}>
            {CITY_STATISTICS.map((stat, idx) => (
              <li
                key={idx}
                className={`flex justify-between p-3 transition-colors ${
                  idx % 2 === 1
                    ? isHighContrast ? 'bg-gray-900' : 'bg-gray-50'
                    : 'bg-transparent'
                }`}
              >
                <span className={`font-semibold text-sm ${isHighContrast ? 'text-gray-300' : 'text-gray-700'}`}>
                  {stat.label}
                </span>
                <span className={`font-bold ${isHighContrast ? 'text-yellow-400' : 'text-[#1e3a8a]'}`}>
                  {stat.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
