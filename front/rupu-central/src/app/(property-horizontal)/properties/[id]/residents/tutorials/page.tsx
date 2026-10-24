'use client';

import { useParams } from 'next/navigation';
import { ResidentsTutorials } from '@/services/modules/horizontal-properties/residents/ui/residents-tutorials';

export default function ResidentsTutorialsPage() {
  const params = useParams();
  const businessId = parseInt(params.id as string);
  if (isNaN(businessId)) return <div className="p-6 text-red-600">ID de propiedad inválido</div>;
  return <ResidentsTutorials businessId={businessId} />;
}
