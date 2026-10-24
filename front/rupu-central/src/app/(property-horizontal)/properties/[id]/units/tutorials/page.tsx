'use client';

import { useParams } from 'next/navigation';
import { UnitsTutorials } from '@/services/modules/horizontal-properties/units/ui/units-tutorials';

export default function UnitsTutorialsPage() {
  const params = useParams();
  const businessId = parseInt(params.id as string);
  if (isNaN(businessId)) return <div className="p-6 text-red-600">ID de propiedad inválido</div>;
  return <UnitsTutorials businessId={businessId} />;
}
