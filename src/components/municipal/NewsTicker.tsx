'use client';

import React from 'react';
import { NEWS_TICKER_ITEMS } from './data';

interface NewsTickerProps {
  isHighContrast?: boolean;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ isHighContrast }) => {
  return (
    <div className={`max-w-6xl mx-auto flex items-stretch border-b ${
      isHighContrast ? 'border-yellow-400 bg-black' : 'border-gray-300 bg-white'
    }`}>
      <div className={`px-4 py-1.5 text-xs font-bold uppercase flex items-center whitespace-nowrap min-w-max relative shadow-sm z-10 ${
        isHighContrast ? 'bg-yellow-400 text-black' : 'bg-[#b91c1c] text-white'
      }`}>
        Latest Updates
        {/* Triangle pointer indicator */}
        <div className={`absolute right-[-8px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 ${
          isHighContrast ? 'border-l-yellow-400' : 'border-l-[#b91c1c]'
        }`}></div>
      </div>
      <div className={`overflow-hidden relative w-full flex items-center ${
        isHighContrast ? 'bg-black text-yellow-300' : 'bg-[#f8fafc] text-gray-800'
      }`}>
        <style>
          {`
            @keyframes oldTicker {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .animate-old-ticker {
              animation: oldTicker 30s linear infinite;
            }
            .animate-old-ticker:hover {
              animation-play-state: paused;
            }
          `}
        </style>
        <div className="whitespace-nowrap animate-old-ticker inline-block text-[13px] font-medium py-1">
          {NEWS_TICKER_ITEMS.map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="mx-4">
                {item.isNew && (
                  <span className={`font-bold mr-1 ${isHighContrast ? 'text-yellow-400' : 'text-red-600'}`}>
                    NEW
                  </span>
                )}
                {item.text}
              </span>
              {idx < NEWS_TICKER_ITEMS.length - 1 && (
                <span className={`mx-2 ${isHighContrast ? 'text-yellow-500' : 'text-blue-300'}`}>|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
