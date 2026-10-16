'use client';

import { residentTypeOptions } from '../domain';
import { ResidentFormDialog } from './resident-form-dialog';

interface CreateResidentModalProps {
  businessId: number;
  /** Tipos del catálogo (del resumen); si no se pasan, los tipos por defecto. */
  types?: Array<{ id: number; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

/** R2 · Agregar residente (modal de 560 px). */
export function CreateResidentModal({ businessId, types, onClose, onSuccess }: CreateResidentModalProps) {
  return <ResidentFormDialog businessId={businessId} types={types ?? residentTypeOptions(undefined)} onClose={onClose} onSuccess={onSuccess} />;
}
