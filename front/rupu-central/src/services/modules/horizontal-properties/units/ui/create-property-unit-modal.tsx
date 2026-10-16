'use client';

import { UnitFormDialog } from './unit-form-dialog';

interface CreatePropertyUnitModalProps {
  businessId: number;
  blocks?: string[];
  coefficientSum?: number;
  defaultBlock?: string;
  onClose: () => void;
  onSuccess: () => void;
}

/** U2 · Nueva unidad (modal de 560 px). */
export function CreatePropertyUnitModal(props: CreatePropertyUnitModalProps) {
  return <UnitFormDialog {...props} />;
}
