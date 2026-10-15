import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmModal } from './confirm-modal';
import { FormModal } from './form-modal';
import { Modal } from './modal';

describe('Modal (hoja inferior en teléfono, centrado en escritorio)', () => {
  it('es un diálogo modal con el título como nombre y se cierra con Esc', async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="Nueva unidad"><p>contenido</p></Modal>);
    const dialog = screen.getByRole('dialog', { name: 'Nueva unidad' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    // La clase modal-content es la que globals.css convierte en hoja inferior en teléfono.
    expect(dialog).toHaveClass('modal-content');
    expect(dialog.parentElement).toHaveClass('modal');
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('cerrado no renderiza nada', () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="X"><p>contenido</p></Modal>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('FormModal y ConfirmModal heredan el diálogo', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const { unmount } = render(<FormModal isOpen onClose={vi.fn()} title="Editar"><input aria-label="Nombre" /></FormModal>);
    expect(within(screen.getByRole('dialog', { name: 'Editar' })).getByLabelText('Nombre')).toBeInTheDocument();
    unmount();

    render(<ConfirmModal isOpen onClose={onClose} onConfirm={onConfirm} title="¿Eliminar?" message="No se puede deshacer" confirmText="Eliminar" />);
    const dialog = screen.getByRole('dialog', { name: '¿Eliminar?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
