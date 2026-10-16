'use client';

import type { PropertyUnit } from '../domain';
import { UnitFormDialog } from './unit-form-dialog';

interface EditPropertyUnitModalProps {
  businessId: number;
  unit: PropertyUnit;
  onClose: () => void;
  onSuccess: () => void;
}

/** U2 · Editar unidad (modal de 560 px). */
export function EditPropertyUnitModal({ businessId, unit, onClose, onSuccess }: EditPropertyUnitModalProps) {
  return <UnitFormDialog businessId={businessId} unit={unit} onClose={onClose} onSuccess={onSuccess} />;
}
