/**
 * Componente: Modal para Editar Rol
 */

'use client';

import { Modal } from '@shared/ui/modal';
import { UpdateRoleForm, UpdateRoleFormProps } from './update-role-form';

export interface UpdateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UpdateRoleFormProps['role'] | null;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function UpdateRoleModal({
  isOpen,
  onClose,
  role,
  onSubmit,
  loading = false
}: UpdateRoleModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Rol"
    >
      <UpdateRoleForm
        role={role}
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  );
}

