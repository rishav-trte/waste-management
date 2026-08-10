'use client';

import React from 'react';
import { PORTAL_TITLE, PORTAL_SUBTITLE } from './data';

interface FooterProps {
  isHighContrast?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isHighContrast }) => {
  return (
    <footer
      className={`pt-8 border-t-[5px] transition-colors ${
        isHighContrast
          ? 'bg-black text-white border-yellow-400'
          : 'bg-[#1e3a8a] text-white border-[#f97316]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm mb-8">
        {/* Contact info with prominent borders */}
        <div className={`md:col-span-1 border-r pr-4 ${isHighContrast ? 'border-gray-800' : 'border-blue-800'}`}>
          <h4 className={`font-bold uppercase mb-3 border-b pb-1 ${
            isHighContrast ? 'text-yellow-400 border-gray-800' : 'text-[#f97316] border-blue-800'
          }`}>
            Contact Us
          </h4>
          <p className="mb-2 leading-relaxed text-[13px]">
            <strong>{PORTAL_TITLE}</strong>
            <br />
            Municipal Solid Waste Complex,
            <br />
            Department of Sanitation - 396220
          </p>
          <p className="mb-2 text-[13px]">
            <strong>Phone:</strong> +91 7016598012
            <br />
            <strong>Toll Free:</strong> 1800-11-2026
          </p>
          <p className="text-[13px] break-words">
            <strong>Email:</strong>
            <br />
            support@wastemgmt.gov.in
            <br />
            contact@wastemgmt.gov.in
          </p>
        </div>

        {/* Standard list of links */}
        <div className={`md:col-span-1 border-r pr-4 ${isHighContrast ? 'border-gray-800' : 'border-blue-800'}`}>
          <h4 className={`font-bold uppercase mb-3 border-b pb-1 ${
            isHighContrast ? 'text-yellow-400 border-gray-800' : 'text-[#f97316] border-blue-800'
          }`}>
            Quick Links
          </h4>
          <ul className="space-y-1.5 text-[13px]">
            <li>
              <a href="#" className="hover:underline hover:text-blue-300">
                » Waste Tariff Rules
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline hover:text-blue-300">
                » Collection Schedule
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline hover:text-blue-300">
                » Tender & Quotations
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline hover:text-blue-300">
                » Government Schemes
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline hover:text-blue-300">
                » Forms & Downloads
              </a>
            </li>
          </ul>
        </div>

        <div className={`md:col-span-1 border-r pr-4 ${isHighContrast ? 'border-gray-800' : 'border-blue-800'}`}>
          <h4 className={`font-bold uppercase mb-3 border-b pb-1 ${
            isHighContrast ? 'text-yellow-400 border-gray-800' : 'text-[#f97316] border-blue-800'
          }`}>
            Policies
          </h4>
          <ul className="space-y-1.5 text-[13px]">
            <li>
              <a href="#" className="hover:underline hover:text-blue-300">
                » Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline hover:text-blue-300">
                » Terms of Use
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline hover:text-blue-300">
                » Copyright Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline hover:text-blue-300">
                » Hyperlinking Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline hover:text-blue-300">
                » Environmental Audit Disclaimer
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-1">
          <h4 className={`font-bold uppercase mb-3 border-b pb-1 ${
            isHighContrast ? 'text-yellow-400 border-gray-800' : 'text-[#f97316] border-blue-800'
          }`}>
            Other Portals
          </h4>
          <div className="flex flex-col space-y-2 mt-2">
            <img
              src="https://placehold.co/120x40/ffffff/000000?text=India.gov.in"
              alt="India.gov.in"
              className="h-8 object-contain bg-white p-1 rounded-sm cursor-pointer"
            />
            <img
              src="https://placehold.co/120x40/ffffff/000000?text=MyGov"
              alt="MyGov"
              className="h-8 object-contain bg-white p-1 rounded-sm cursor-pointer"
            />
            <img
              src="https://placehold.co/120x40/ffffff/000000?text=Digital+India"
              alt="Digital India"
              className="h-8 object-contain bg-white p-1 rounded-sm cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Bottom dense copyright bar */}
      <div className={`py-3 text-center text-[11px] border-t ${
        isHighContrast ? 'bg-gray-950 text-gray-400 border-gray-800' : 'bg-[#0f172a] text-gray-400 border-gray-700'
      }`}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p>
            Contents owned and maintained by {PORTAL_TITLE}, {PORTAL_SUBTITLE}.
          </p>
          <p>© 2026 {PORTAL_TITLE}. All rights reserved.</p>
          <p>
            Designed & Developed by:{' '}
            <span className={isHighContrast ? 'text-yellow-400 font-semibold' : 'text-white'}>
              National Informatics Centre
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
