export interface NavLink {
  name: string;
  link: string;
  hasDropdown?: boolean;
  dropdownItems?: { label: string; href: string }[];
}

export interface ServiceItem {
  title: string;
  icon: string;
  href?: string;
}

export interface QuickLinkItem {
  label: string;
  href: string;
  isNew?: boolean;
}

export interface SchemeItem {
  code: string;
  title: string;
  description: string;
  href?: string;
}

export interface PlaceToVisit {
  name: string;
  image: string;
  href?: string;
}

export interface CityStatistic {
  label: string;
  value: string;
}

export interface OfficialProfile {
  name: string;
  designation: string;
  organization: string;
  photoUrl: string;
}

export type TextScale = 'normal' | 'large' | 'xlarge';
