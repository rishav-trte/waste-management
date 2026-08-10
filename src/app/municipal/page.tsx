import { Metadata } from 'next';
import { MunicipalTheme } from '@/components/municipal/MunicipalTheme';

export const metadata: Metadata = {
  title: 'Waste Management System | Municipal Portal',
  description: 'Municipal Portal Theme view for Waste Management System.',
};

export default function MunicipalPage() {
  return <MunicipalTheme />;
}
