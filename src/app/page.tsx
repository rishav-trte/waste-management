import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const role = session.user.role;
  if (['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'].includes(role)) {
    redirect('/admin/dashboard');
  } else if (role === 'USER') {
    redirect('/portal/request-collection');
  } else {
    redirect('/collector/collect');
  }
}
