'use client';

import { UnitFormDialog } from './unit-form-dialog';

interface CreatePropertyUnitModalProps {
  businessId: number;
  onClose: () => void;
  onSuccess: () => void;
}

/** U2 · Crear unidad (modal de 560 px). */
export function CreatePropertyUnitModal({ businessId, onClose, onSuccess }: CreatePropertyUnitModalProps) {
  return <UnitFormDialog businessId={businessId} onClose={onClose} onSuccess={onSuccess} />;
}
