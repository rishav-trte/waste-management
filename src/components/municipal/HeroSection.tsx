'use client';

import React, { useState } from 'react';
import { QUICK_LINKS, OFFICIAL_PROFILE } from './data';

interface HeroSectionProps {
  isHighContrast?: boolean;
}

const CAROUSEL_SLIDES = [
  {
    image: 'https://placehold.co/600x300/e2e8f0/1e3a8a?text=Municipal+Building+Banner',
    caption: "Hon'ble Administrator inspecting civic works in Daman.",
  },
  {
    image: 'https://placehold.co/600x300/1e293b/38bdf8?text=Smart+Waste+Management+Drive',
    caption: 'Clean Daman Clean India - Integrated Solid Waste Telemetry Campaign 2026.',
  },
  {
    image: 'https://placehold.co/600x300/064e3b/34d399?text=Civic+Infrastructure+Development',
    caption: 'Inauguration of modernized municipal waste processing facility.',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ isHighContrast }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <div className="max-w-6xl mx-auto mt-4 px-4 flex flex-col md:flex-row gap-4">
      {/* Left Sidebar - Quick Links Panel */}
      <div className={`w-full md:w-1/4 border shadow-sm rounded-sm self-start ${
        isHighContrast ? 'bg-black border-yellow-400' : 'bg-white border-gray-300'
      }`}>
        <div className={`px-3 py-2 text-sm font-bold border-b-2 uppercase ${
          isHighContrast
            ? 'bg-yellow-400 text-black border-yellow-500'
            : 'bg-[#1e3a8a] text-white border-[#f97316]'
        }`}>
          Quick Links
        </div>
        <ul className={`divide-y text-[13px] ${isHighContrast ? 'divide-gray-800' : 'divide-gray-200'}`}>
          {QUICK_LINKS.map((link, idx) => (
            <li key={idx}>
              <a
                href={link.href}
                className={`flex items-center px-3 py-2 transition-all ${
                  isHighContrast
                    ? 'text-yellow-400 hover:bg-gray-900 hover:text-white hover:pl-4'
                    : 'text-[#0369a1] hover:bg-gray-50 hover:text-red-600 hover:pl-4'
                }`}
              >
                » {link.label}
                {link.isNew && (
                  <img
                    src="https://placehold.co/200x100/ff0000/ffffff?text=New"
                    className="ml-2 h-2.5"
                    alt="new"
                  />
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Center Main Carousel Area */}
      <div className={`w-full md:w-2/4 border p-1 shadow-sm relative ${
        isHighContrast ? 'bg-black border-yellow-400' : 'bg-white border-gray-300'
      }`}>
        <div className="relative w-full h-[250px] md:h-[300px] bg-gray-200 overflow-hidden">
          <img
            src={CAROUSEL_SLIDES[activeSlide].image}
            alt="Municipal Banner"
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-70 text-white text-sm p-2">
            {CAROUSEL_SLIDES[activeSlide].caption}
          </div>
          {/* Classic Carousel controls */}
          <div className="absolute bottom-2 right-2 flex space-x-1 z-10">
            {CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`w-3 h-3 border border-white cursor-pointer transition-colors ${
                  activeSlide === idx
                    ? isHighContrast ? 'bg-yellow-400' : 'bg-[#f97316]'
                    : 'bg-gray-400'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Official Profile & Action Badges */}
      <div className="w-full md:w-1/4 flex flex-col gap-3">
        {/* Profile Card style common for officials */}
        <div className={`border shadow-sm rounded-sm text-center p-3 ${
          isHighContrast ? 'bg-black border-yellow-400 text-white' : 'bg-white border-gray-300'
        }`}>
          <div className="w-20 h-24 mx-auto bg-gray-200 border border-gray-400 mb-2 overflow-hidden">
            <img
              src={OFFICIAL_PROFILE.photoUrl}
              alt={OFFICIAL_PROFILE.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className={`text-sm font-bold ${isHighContrast ? 'text-yellow-400' : 'text-[#1e3a8a]'}`}>
            {OFFICIAL_PROFILE.name}
          </h3>
          <p className={`text-[11px] ${isHighContrast ? 'text-gray-300' : 'text-gray-600'}`}>
            {OFFICIAL_PROFILE.designation}
            <br />
            {OFFICIAL_PROFILE.organization}
          </p>
        </div>

        {/* Action Buttons styled like traditional badges/buttons */}
        <a
          href="#"
          className={`text-center py-2 px-3 text-sm font-bold border rounded shadow flex justify-between items-center transition-all ${
            isHighContrast
              ? 'bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-300'
              : 'bg-gradient-to-b from-blue-600 to-blue-800 text-white border-blue-900 hover:from-blue-700 hover:to-blue-900'
          }`}
        >
          <span>Pay Property Tax</span>
          <span className={`rounded-full w-5 h-5 flex items-center justify-center text-xs ${
            isHighContrast ? 'bg-black text-yellow-400' : 'bg-white text-blue-800'
          }`}>
            »
          </span>
        </a>
        <a
          href="#"
          className={`text-center py-2 px-3 text-sm font-bold border rounded shadow flex justify-between items-center transition-all ${
            isHighContrast
              ? 'bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-400'
              : 'bg-gradient-to-b from-[#ea580c] to-[#c2410c] text-white border-[#9a3412] hover:from-[#c2410c] hover:to-[#9a3412]'
          }`}
        >
          <span>Register Complaint</span>
          <span className={`rounded-full w-5 h-5 flex items-center justify-center text-xs ${
            isHighContrast ? 'bg-black text-yellow-500' : 'bg-white text-[#c2410c]'
          }`}>
            »
          </span>
        </a>
        <a
          href="#"
          className={`text-center py-2 px-3 text-sm font-bold border rounded shadow flex justify-between items-center transition-all ${
            isHighContrast
              ? 'bg-yellow-600 text-black border-yellow-700 hover:bg-yellow-500'
              : 'bg-gradient-to-b from-green-600 to-green-800 text-white border-green-900 hover:from-green-700 hover:to-green-900'
          }`}
        >
          <span>Shop & Establishment</span>
          <span className={`rounded-full w-5 h-5 flex items-center justify-center text-xs ${
            isHighContrast ? 'bg-black text-yellow-600' : 'bg-white text-green-800'
          }`}>
            »
          </span>
        </a>
      </div>
    </div>
  );
};
