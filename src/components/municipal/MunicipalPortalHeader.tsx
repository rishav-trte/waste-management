'use client';

import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { TextScale } from '@/types/municipal';
import { PORTAL_TITLE, PORTAL_SUBTITLE } from './data';

interface MunicipalPortalHeaderProps {
  portalTitle?: string;
  portalSubtitle?: string;
  showNavLinks?: boolean;
}

export const MunicipalPortalHeader: React.FC<MunicipalPortalHeaderProps> = ({
  portalTitle = PORTAL_TITLE,
  portalSubtitle = PORTAL_SUBTITLE,
}) => {
  const [textScale, setTextScale] = useState<TextScale>('normal');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  return (
    <header className="w-full border-b shadow-sm">
      {/* Top Bar for Accessibility */}
      <TopBar
        textScale={textScale}
        setTextScale={setTextScale}
        isHighContrast={isHighContrast}
        setIsHighContrast={setIsHighContrast}
      />

      {/* Main Government Banner */}
      <div
        className={`w-full py-3 px-4 md:px-6 transition-colors ${
          isHighContrast
            ? 'bg-black text-white border-b border-yellow-400'
            : 'bg-white text-gray-900 border-b border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-4">
            {/* Government Emblem */}
            <div className="w-10 h-14 bg-gradient-to-b from-yellow-100 to-yellow-300 border border-yellow-500 rounded-t-full flex items-center justify-center p-1 shadow-sm shrink-0">
              <img
                src="https://placehold.co/40x50/eab308/000000?text=Emblem"
                alt="Emblem"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className={`flex flex-col border-l-2 pl-3 ${isHighContrast ? 'border-yellow-400' : 'border-[#1e3a8a]'}`}>
              <h1
                className={`font-bold text-lg md:text-xl uppercase tracking-wider ${
                  isHighContrast ? 'text-yellow-400' : 'text-[#1e3a8a]'
                }`}
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {portalTitle}
              </h1>
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  isHighContrast ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {portalSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <img
              src="https://placehold.co/100x40/ffffff/1e3a8a?text=Swachh+Bharat"
              alt="Swachh Bharat"
              className="h-9 border border-gray-200 hidden sm:block"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
