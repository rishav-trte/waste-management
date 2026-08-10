'use client';

import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { Header } from './Header';
import { NewsTicker } from './NewsTicker';
import { HeroSection } from './HeroSection';
import { InformationSection } from './InformationSection';
import { ServicesGrid } from './ServicesGrid';
import { LowerSections } from './LowerSections';
import { Footer } from './Footer';
import { TextScale } from '@/types/municipal';

export const MunicipalTheme: React.FC = () => {
  const [textScale, setTextScale] = useState<TextScale>('normal');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  const getScaleClass = () => {
    switch (textScale) {
      case 'large':
        return 'text-[105%]';
      case 'xlarge':
        return 'text-[115%]';
      default:
        return 'text-[100%]';
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-all ${getScaleClass()} ${
        isHighContrast
          ? 'bg-black text-white'
          : 'bg-[#f1f5f9] text-gray-900'
      }`}
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      id="main-content"
    >
      {/* 
        This wrapper mimics the boxed layout often used in older sites, 
        where the content doesn't stretch to the edges on large monitors.
      */}
      <div className={`w-full ${isHighContrast ? 'bg-black' : 'bg-[#f1f5f9]'}`}>
        <TopBar
          textScale={textScale}
          setTextScale={setTextScale}
          isHighContrast={isHighContrast}
          setIsHighContrast={setIsHighContrast}
        />
        <Header isHighContrast={isHighContrast} />
        <NewsTicker isHighContrast={isHighContrast} />

        <main
          className={`pb-10 ${
            isHighContrast
              ? 'bg-black'
              : "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"
          }`}
        >
          <HeroSection isHighContrast={isHighContrast} />
          <InformationSection isHighContrast={isHighContrast} />
          <ServicesGrid isHighContrast={isHighContrast} />
          <LowerSections isHighContrast={isHighContrast} />
        </main>

        <Footer isHighContrast={isHighContrast} />
      </div>
    </div>
  );
};

export default MunicipalTheme;
