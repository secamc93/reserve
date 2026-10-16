'use client';

import type { PropertyUnit } from '../domain';
import { UnitFormDialog } from './unit-form-dialog';

interface EditPropertyUnitModalProps {
  businessId: number;
  unit: PropertyUnit;
  blocks?: string[];
  coefficientSum?: number;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: (unit: PropertyUnit) => void;
}

/** U2 · Editar unidad (modal de 560 px). */
export function EditPropertyUnitModal(props: EditPropertyUnitModalProps) {
  return <UnitFormDialog {...props} />;
}
