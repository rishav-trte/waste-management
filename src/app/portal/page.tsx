import { Metadata } from 'next';
import { MunicipalTheme } from '@/components/municipal/MunicipalTheme';

export const metadata: Metadata = {
  title: 'Waste Management System | Citizen Portal',
  description:
    'Official Citizen Portal of Municipal Waste Management System & Environment. Access citizen services, waste fee payments, and civic information.',
};

export default function PortalPage() {
  return <MunicipalTheme />;
}
