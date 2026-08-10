import {
  NavLink,
  QuickLinkItem,
  ServiceItem,
  SchemeItem,
  PlaceToVisit,
  CityStatistic,
  OfficialProfile,
} from '@/types/municipal';

export const PORTAL_TITLE = 'Waste Management System';
export const PORTAL_SUBTITLE = 'Department of Municipal Waste & Environment';

export const NAV_LINKS: NavLink[] = [
  { name: 'Home', link: '#' },
  {
    name: 'About Us',
    link: '#',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Overview', href: '#' },
      { label: 'Departments', href: '#' },
      { label: 'Contacts', href: '#' },
    ],
  },
  {
    name: 'Council',
    link: '#',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Council Members', href: '#' },
      { label: 'Resolutions', href: '#' },
      { label: 'Committees', href: '#' },
    ],
  },
  {
    name: 'Services',
    link: '#',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Online Services', href: '#' },
      { label: 'Grievances', href: '#' },
      { label: 'Forms Download', href: '#' },
    ],
  },
  {
    name: 'Citizen',
    link: '#',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Citizen Charter', href: '#' },
      { label: 'Public Notices', href: '#' },
      { label: 'RTI Act', href: '#' },
    ],
  },
  {
    name: 'Information',
    link: '#',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Budget & Finances', href: '#' },
      { label: 'Master Plan', href: '#' },
      { label: 'Projects', href: '#' },
    ],
  },
  { name: 'Tenders', link: '#' },
  { name: 'FAQ', link: '#' },
];

export const QUICK_LINKS: QuickLinkItem[] = [
  { label: 'Tenders & Quotations', href: '#' },
  { label: 'Circulars & Notifications', href: '#', isNew: true },
  { label: 'Recruitments / Vacancies', href: '#' },
  { label: 'Government Schemes', href: '#' },
  { label: 'Online Services', href: '#' },
  { label: 'Register Complaint', href: '#' },
];

export const CITIZEN_SERVICES: ServiceItem[] = [
  { title: 'Waste Pickup Request', icon: '🗑️' },
  { title: 'Property Tax & Tariffs', icon: '🏠' },
  { title: 'Commercial Sanitation', icon: '🏢' },
  { title: 'Trade Licence & Audit', icon: '📝' },
  { title: 'Recycling Connection', icon: '♻️' },
  { title: 'Grievances & Redressal', icon: '📜' },
];

export const SCHEMES: SchemeItem[] = [
  {
    code: 'SBM',
    title: 'Swachh Bharat Mission 2.0',
    description:
      'Zero waste initiative for urban municipalities to accelerate 100% segregated collection and processing.',
  },
  {
    code: 'PMAY',
    title: 'Pradhan Mantri Awas Yojana',
    description:
      'Integrated municipal infrastructure and sanitation services for urban housing projects.',
  },
  {
    code: 'AMRUT',
    title: 'Atal Mission for Rejuvenation',
    description:
      'Providing sustainable civic amenities, smart waste telemetry, and environmental conservation.',
  },
];

export const PLACES_TO_VISIT: PlaceToVisit[] = [
  {
    name: 'Central Processing Facility',
    image: 'https://placehold.co/200x120/e2e8f0/1e3a8a?text=Processing+Plant',
  },
  {
    name: 'Smart Recycling Hub',
    image: 'https://placehold.co/200x120/e2e8f0/1e3a8a?text=Recycling+Center',
  },
  {
    name: 'Biogas Energy Plant',
    image: 'https://placehold.co/200x120/e2e8f0/1e3a8a?text=Biogas+Facility',
  },
  {
    name: 'Civic Environmental Park',
    image: 'https://placehold.co/200x120/e2e8f0/1e3a8a?text=Eco+Park',
  },
];

export const CITY_STATISTICS: CityStatistic[] = [
  { label: 'Total Population', value: '1,91,173' },
  { label: 'Daily Collection Capacity', value: '150+ Tons' },
  { label: 'Municipal Wards', value: '15' },
  { label: 'Segregation Rate', value: '98.5 %' },
];

export const OFFICIAL_PROFILE: OfficialProfile = {
  name: 'Shri. Admin Officer',
  designation: "Director of Municipal Waste",
  organization: 'Department of Waste & Environment',
  photoUrl: 'https://placehold.co/80x96/d1d5db/4b5563?text=Director',
};

export const NEWS_TICKER_ITEMS = [
  { isNew: true, text: 'Updated Municipal Solid Waste Management Tariff Rules, 2026.' },
  { isNew: true, text: 'Online Property Tax & Dynamic Waste Billing Portal is now active.' },
  { isNew: false, text: 'Notice regarding automated route telemetry and GPS collection schedules.' },
];
