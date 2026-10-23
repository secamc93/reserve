'use client';

import { useParams } from 'next/navigation';
import { MembershipPlans } from '@/services/modules/horizontal-properties/voting/ui/billing/membership-plans';

export default function VotingPlansPage() {
  const params = useParams();
  const businessId = parseInt(params.id as string);

  if (isNaN(businessId)) {
    return (
      <div className="p-6">
        <div className="text-red-600">ID de propiedad inválido</div>
      </div>
    );
  }

  return <MembershipPlans businessId={businessId} />;
}
