'use client';

import React, { useState } from 'react';
import { NAV_LINKS, PORTAL_TITLE, PORTAL_SUBTITLE } from './data';

const MenuIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

interface HeaderProps {
  isHighContrast?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isHighContrast }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className={`w-full border-b shadow-sm ${isHighContrast ? 'bg-black text-white border-yellow-400' : 'bg-white'}`}>
      {/* Header Logo Area - Using standard serif fonts and boxed layout */}
      <div className={`max-w-6xl mx-auto px-4 py-3 flex justify-between items-center border-x ${isHighContrast ? 'bg-gray-900 border-yellow-400' : 'bg-[#f8fafc] border-gray-200'}`}>
        <div className="flex items-center space-x-4">
          {/* Emblem placeholder */}
          <div className="w-12 h-16 bg-gradient-to-b from-yellow-100 to-yellow-300 border border-yellow-500 rounded-t-full flex items-center justify-center p-1 shadow-sm">
            <img
              src="https://placehold.co/40x50/eab308/000000?text=Emblem"
              alt="Emblem"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
          <div className={`flex flex-col border-l-2 pl-3 ${isHighContrast ? 'border-yellow-400' : 'border-[#1e3a8a]'}`}>
            <h1
              className={`font-bold text-xl md:text-2xl uppercase tracking-wider ${isHighContrast ? 'text-yellow-400' : 'text-[#1e3a8a]'}`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {PORTAL_TITLE}
            </h1>
            <span className={`text-xs md:text-sm font-semibold uppercase tracking-wide ${isHighContrast ? 'text-gray-300' : 'text-gray-700'}`}>
              {PORTAL_SUBTITLE}
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end space-y-2">
          <img
            src="https://placehold.co/100x40/ffffff/1e3a8a?text=Swachh+Bharat"
            alt="Swachh Bharat"
            className="h-10 border border-gray-200"
          />
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden p-2 border rounded ${isHighContrast ? 'text-yellow-400 border-yellow-400' : 'text-[#1e3a8a] border-[#1e3a8a]'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Main Navigation Bar - Distinct solid blue bar common in municipal themes */}
      <nav className={`w-full border-t ${isHighContrast ? 'bg-black border-yellow-400' : 'bg-[#1e3a8a] border-blue-400'}`}>
        <div className="max-w-6xl mx-auto px-0 md:px-4 hidden md:flex items-center justify-between">
          <ul className={`flex items-center text-sm font-medium text-white divide-x ${isHighContrast ? 'divide-yellow-600' : 'divide-blue-800'}`}>
            {NAV_LINKS.map((link, index) => (
              <li key={index} className="relative group">
                <a
                  href={link.link}
                  className={`block px-4 py-2.5 transition-colors uppercase text-[12px] tracking-wider ${
                    isHighContrast
                      ? 'hover:bg-yellow-400 hover:text-black text-white'
                      : 'hover:bg-[#f97316] hover:text-white text-white'
                  }`}
                >
                  {link.name}{' '}
                  {link.hasDropdown && (
                    <span className="text-[10px] ml-1">▼</span>
                  )}
                </a>
                {/* Dropdown menu */}
                {link.hasDropdown && (
                  <ul className={`absolute left-0 top-full hidden group-hover:block w-48 border shadow-md z-50 divide-y ${
                    isHighContrast
                      ? 'bg-black border-yellow-400 divide-gray-800'
                      : 'bg-white border-gray-300 divide-gray-100'
                  }`}>
                    {(link.dropdownItems || [
                      { label: 'Overview', href: '#' },
                      { label: 'Departments', href: '#' },
                      { label: 'Contacts', href: '#' },
                    ]).map((item, idx) => (
                      <li key={idx}>
                        <a
                          href={item.href}
                          className={`block px-4 py-2 text-[13px] transition-colors ${
                            isHighContrast
                              ? 'text-yellow-300 hover:bg-yellow-400 hover:text-black'
                              : 'text-gray-800 hover:bg-blue-50 hover:text-[#1e3a8a]'
                          }`}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <a
            href="#"
            className="bg-[#dc2626] text-white px-4 py-2.5 font-bold text-[12px] uppercase tracking-wider hover:bg-red-700 cursor-pointer animate-pulse"
          >
            Pay Waste Fees Online
          </a>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <ul className={`md:hidden flex flex-col border-t divide-y ${
            isHighContrast
              ? 'bg-black border-yellow-400 divide-gray-800'
              : 'bg-white border-gray-200 divide-gray-100'
          }`}>
            {NAV_LINKS.map((link, index) => (
              <li key={`mob-${index}`}>
                <a
                  href={link.link}
                  className={`block px-4 py-3 text-sm font-medium uppercase ${
                    isHighContrast ? 'text-yellow-400 hover:bg-gray-900' : 'text-[#1e3a8a] hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#"
                className="block px-4 py-3 text-sm text-red-600 font-bold bg-red-50 uppercase"
              >
                Pay Waste Fees Online
              </a>
            </li>
          </ul>
        )}
      </nav>
    </div>
  );
};
