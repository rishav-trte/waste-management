'use client';

import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { TextScale } from '@/types/municipal';
import { PORTAL_TITLE, PORTAL_SUBTITLE } from './data';
import { signOut, useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';

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
  const { data: session } = useSession();

  return (
    <header className="w-full border-b shadow-sm shrink-0">
      {/* Top Bar for Accessibility */}
      <TopBar
        textScale={textScale}
        setTextScale={setTextScale}
        isHighContrast={isHighContrast}
        setIsHighContrast={setIsHighContrast}
      />

      {/* Main Government Banner */}
      <div
        className={`w-full py-2 px-3 sm:px-6 transition-colors ${
          isHighContrast
            ? 'bg-black text-white border-b border-yellow-400'
            : 'bg-white text-gray-900 border-b border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
            {/* Government Emblem */}
            <div className="w-7 h-10 sm:w-10 sm:h-14 bg-gradient-to-b from-yellow-100 to-yellow-300 border border-yellow-500 rounded-t-full flex items-center justify-center p-0.5 sm:p-1 shadow-sm shrink-0">
              <img
                src="https://placehold.co/40x50/eab308/000000?text=Emblem"
                alt="Emblem"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className={`flex flex-col border-l-2 pl-2 sm:pl-3 min-w-0 ${isHighContrast ? 'border-yellow-400' : 'border-[#1e3a8a]'}`}>
              <h1
                className={`font-bold text-xs sm:text-lg md:text-xl uppercase tracking-wider truncate ${
                  isHighContrast ? 'text-yellow-400' : 'text-[#1e3a8a]'
                }`}
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {portalTitle}
              </h1>
              <span
                className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide truncate ${
                  isHighContrast ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {portalSubtitle}
              </span>
            </div>
          </div>

          {/* Officer Status & Mobile Sign Out */}
          {session?.user && (
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1.5 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
              <div className="text-left sm:text-right min-w-0">
                <p className="text-[11px] font-bold text-slate-800 truncate max-w-[130px] sm:max-w-[180px]">
                  {session.user.name}
                </p>
                <p className="text-[9px] font-extrabold text-orange-600 uppercase tracking-wider">
                  {session.user.role}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-all shadow-sm shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
