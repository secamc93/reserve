'use client';

import { useParams } from 'next/navigation';
import { TutorialsLibrary } from '@/services/modules/horizontal-properties/voting/ui/guide/tutorials-library';

export default function TutorialsPage() {
  const params = useParams();
  const businessId = parseInt(params.id as string);

  if (isNaN(businessId)) {
    return (
      <div className="p-6">
        <div className="text-red-600">ID de propiedad inválido</div>
      </div>
    );
  }

  return <TutorialsLibrary businessId={businessId} />;
}
