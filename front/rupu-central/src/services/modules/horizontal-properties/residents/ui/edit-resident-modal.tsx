'use client';

import type { Resident } from '../domain';
import { residentTypeOptions } from '../domain';
import { ResidentFormDialog } from './resident-form-dialog';

interface EditResidentModalProps {
  businessId: number;
  resident: Resident;
  types?: Array<{ id: number; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

/** R2 · Editar residente (modal de 560 px). */
export function EditResidentModal({ businessId, resident, types, onClose, onSuccess }: EditResidentModalProps) {
  return (
    <ResidentFormDialog
      businessId={businessId}
      resident={resident}
      types={types ?? residentTypeOptions(undefined)}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
