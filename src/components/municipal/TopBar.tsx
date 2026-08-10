'use client';

import React from 'react';
import { TextScale } from '@/types/municipal';

const SearchIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
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
      className={`text-white text-[11px] py-1 px-4 flex justify-between items-center w-full border-b-[3px] transition-colors ${
        isHighContrast
          ? 'bg-black border-yellow-400'
          : 'bg-[#1e3a8a] border-[#f97316]'
      }`}
    >
      <div className="flex space-x-4 items-center">
        <a
          href="#main-content"
          className="hover:underline hidden sm:block text-[#fb923c] font-medium"
        >
          Skip To Main Content
        </a>
        <div className="flex space-x-1 items-center bg-[#0f172a] px-2 py-0.5 rounded-sm">
          <button
            onClick={() => setTextScale('normal')}
            className={`px-1 font-bold hover:text-[#fb923c] border-r border-gray-600 ${
              textScale === 'normal' ? 'text-[#fb923c]' : 'text-white'
            }`}
            title="Standard Font Size (A-)"
          >
            A-
          </button>
          <button
            onClick={() => setTextScale('large')}
            className={`px-1 font-bold hover:text-[#fb923c] border-r border-gray-600 ${
              textScale === 'large' ? 'text-[#fb923c]' : 'text-white'
            }`}
            title="Medium Font Size (A)"
          >
            A
          </button>
          <button
            onClick={() => setTextScale('xlarge')}
            className={`px-1 font-bold hover:text-[#fb923c] ${
              textScale === 'xlarge' ? 'text-[#fb923c]' : 'text-white'
            }`}
            title="Large Font Size (A+)"
          >
            A+
          </button>
        </div>
        <div className="flex space-x-1 items-center bg-[#0f172a] px-2 py-0.5 rounded-sm">
          <button
            onClick={() => setIsHighContrast(false)}
            className={`w-3 h-3 bg-white border rounded-full transition-transform ${
              !isHighContrast
                ? 'border-orange-500 scale-125 ring-1 ring-white'
                : 'border-gray-400 opacity-70'
            }`}
            title="Standard Theme"
          />
          <button
            onClick={() => setIsHighContrast(true)}
            className={`w-3 h-3 bg-black border rounded-full transition-transform ${
              isHighContrast
                ? 'border-yellow-400 scale-125 ring-1 ring-yellow-400'
                : 'border-white opacity-70'
            }`}
            title="High Contrast Theme"
          />
        </div>
      </div>
      <div className="flex space-x-3 items-center">
        <div className="hidden sm:flex items-center space-x-2">
          <span className="text-gray-300">Language:</span>
          <select
            defaultValue="en"
            className="bg-white text-black text-[11px] py-0.5 px-1 border border-gray-300 rounded-sm focus:outline-none"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="gu">ગુજરાતી</option>
          </select>
        </div>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="text-black text-[11px] px-2 py-0.5 w-24 sm:w-32 border-none focus:ring-0 focus:outline-none rounded-l-sm"
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
