'use client';

import React from 'react';
import { TextScale } from '@/types/municipal';

const SearchIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-3.5 w-3.5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    />
  </svg>
);

interface TopBarProps {
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  isHighContrast: boolean;
  setIsHighContrast: (contrast: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  textScale,
  setTextScale,
  isHighContrast,
  setIsHighContrast,
}) => {
  return (
    <div
      className={`text-white text-[11px] py-1 px-2 sm:px-4 flex flex-wrap justify-between items-center w-full border-b-[3px] transition-colors gap-1 sm:gap-2 overflow-hidden ${
        isHighContrast
          ? 'bg-black border-yellow-400'
          : 'bg-[#1e3a8a] border-[#f97316]'
      }`}
    >
      <div className="flex space-x-2 sm:space-x-4 items-center shrink-0">
        <a
          href="#main-content"
          className="hover:underline hidden md:block text-[#fb923c] font-medium"
        >
          Skip To Main Content
        </a>
        <div className="flex space-x-1 items-center bg-[#0f172a] px-1.5 py-0.5 rounded-sm">
          <button
            onClick={() => setTextScale('normal')}
            className={`px-1 text-[10px] font-bold hover:text-[#fb923c] border-r border-gray-600 ${
              textScale === 'normal' ? 'text-[#fb923c]' : 'text-white'
            }`}
            title="Standard Font Size (A-)"
          >
            A-
          </button>
          <button
            onClick={() => setTextScale('large')}
            className={`px-1 text-[10px] font-bold hover:text-[#fb923c] border-r border-gray-600 ${
              textScale === 'large' ? 'text-[#fb923c]' : 'text-white'
            }`}
            title="Medium Font Size (A)"
          >
            A
          </button>
          <button
            onClick={() => setTextScale('xlarge')}
            className={`px-1 text-[10px] font-bold hover:text-[#fb923c] ${
              textScale === 'xlarge' ? 'text-[#fb923c]' : 'text-white'
            }`}
            title="Large Font Size (A+)"
          >
            A+
          </button>
        </div>
        <div className="flex space-x-1 items-center bg-[#0f172a] px-1.5 py-0.5 rounded-sm">
          <button
            onClick={() => setIsHighContrast(false)}
            className={`w-2.5 h-2.5 bg-white border rounded-full transition-transform ${
              !isHighContrast
                ? 'border-orange-500 scale-125 ring-1 ring-white'
                : 'border-gray-400 opacity-70'
            }`}
            title="Standard Theme"
          />
          <button
            onClick={() => setIsHighContrast(true)}
            className={`w-2.5 h-2.5 bg-black border rounded-full transition-transform ${
              isHighContrast
                ? 'border-yellow-400 scale-125 ring-1 ring-yellow-400'
                : 'border-white opacity-70'
            }`}
            title="High Contrast Theme"
          />
        </div>
      </div>

      <div className="flex space-x-2 items-center ml-auto shrink-0">
        <div className="hidden sm:flex items-center space-x-1">
          <span className="text-gray-300 text-[10px]">Lang:</span>
          <select
            defaultValue="en"
            className="bg-white text-black text-[10px] py-0.5 px-1 border border-gray-300 rounded-sm focus:outline-none"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="text-black text-[10px] px-1.5 py-0.5 w-20 sm:w-28 border-none focus:ring-0 focus:outline-none rounded-l-sm"
          />
          <button
            type="button"
            className="bg-[#f97316] p-1 text-white hover:bg-[#c2410c] rounded-r-sm transition-colors"
          >
            <SearchIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
