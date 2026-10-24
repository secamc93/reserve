/**
 * Acciones sobre un usuario (rediseño IAM 2a): las comparten el menú "más acciones" de cada fila
 * y la ficha lateral. `useUserActions` devuelve los ítems del menú y los diálogos que abren
 * (confirmaciones y la clave generada, que se muestra una sola vez).
 *
 * Super admin: solo otro super admin lo da o lo quita, y nadie se lo quita a sí mismo.
 */

'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { TokenStorage } from '@shared/config';
import { VtDialog, VtNotice, vtBtn, type VtMenuItem } from '@shared/ui/ds';
import { dsMono } from '@shared/ui/ds/fonts';
import { usePermissions } from '@/services/auth/permissions/ui/hooks/use-permissions';
import { deleteUserAction, generatePasswordAction, setSuperAdminAction, updateUserAction } from '../../infrastructure/actions';
import type { UserListItem } from '../../domain/entities/user-list.entity';

export type UserRow = Pick<UserListItem, 'id' | 'name' | 'email' | 'is_active' | 'is_super_user'> & Partial<UserListItem>;

type Pending = { kind: 'superAdmin' | 'password' | 'toggleActive' | 'delete'; user: UserRow };

export interface UserActionHandlers {
  onEdit?: (user: UserRow) => void;
  onAssignRoles?: (user: UserRow) => void;
  /** Tras un cambio que obliga a recargar la lista. */
  onChanged?: () => void;
  /** Tras eliminar (p. ej. para cerrar la ficha). */
  onDeleted?: (user: UserRow) => void;
}

export function useUserActions({ onEdit, onAssignRoles, onChanged, onDeleted }: UserActionHandlers = {}) {
  const { permissions } = usePermissions();
  const viewerIsSuperAdmin = !!permissions?.isSuperAdmin;
  const viewerId = TokenStorage.getUser()?.id;
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [password, setPassword] = useState<{ email?: string; password?: string } | null>(null);

  const canToggleSuperAdmin = useCallback(
    (user: UserRow) => viewerIsSuperAdmin && !(user.is_super_user && user.id === viewerId),
    [viewerIsSuperAdmin, viewerId],
  );

  const ask = (kind: Pending['kind'], user: UserRow) => {
    setDialogError(null);
    setPending({ kind, user });
  };

  const menuItems = (user: UserRow): VtMenuItem[] => [
    ...(onEdit ? [{ label: 'Editar datos', onSelect: () => onEdit(user) }] : []),
    ...(onAssignRoles ? [{ label: 'Cambiar roles', onSelect: () => onAssignRoles(user) }] : []),
    { label: 'Restablecer clave', onSelect: () => ask('password', user) },
    ...(canToggleSuperAdmin(user)
      ? [{ label: user.is_super_user ? 'Quitar super admin' : 'Hacer super admin', onSelect: () => ask('superAdmin', user) }]
      : []),
    { label: user.is_active ? 'Desactivar' : 'Activar', onSelect: () => ask('toggleActive', user) },
    { label: 'Eliminar', danger: true, onSelect: () => ask('delete', user) },
  ];

  const confirm = async () => {
    const token = TokenStorage.getBusinessToken();
    if (!pending || !token) return;
    const { kind, user } = pending;
    setBusy(true);
    setDialogError(null);
    try {
      if (kind === 'superAdmin') {
        const enabled = !user.is_super_user;
        const r = await setSuperAdminAction({ token, user_id: user.id, enabled });
        if (!r.success) throw new Error(r.error ?? 'No se pudo cambiar el rol de super admin');
        setNotice({
          ok: true,
          text: enabled
            ? `${user.name} ahora es super admin. Debe cerrar sesión y volver a entrar para que aplique.`
            : `${user.name} ya no es super admin.`,
        });
        onChanged?.();
      } else if (kind === 'password') {
        const r = await generatePasswordAction({ token, user_id: user.id });
        if (!r.success || !r.data) throw new Error(r.error ?? 'No se pudo generar la clave');
        setPassword(r.data);
      } else if (kind === 'toggleActive') {
        const r = await updateUserAction({ token, id: user.id, is_active: !user.is_active });
        if (!r.success) throw new Error(r.error ?? 'No se pudo cambiar el estado');
        setNotice({ ok: true, text: user.is_active ? `${user.name} quedó inactivo: ya no puede entrar.` : `${user.name} quedó activo.` });
        onChanged?.();
      } else {
        const r = await deleteUserAction({ id: user.id, token });
        if (!r.success) throw new Error(r.error ?? 'No se pudo eliminar el usuario');
        setNotice({ ok: true, text: `${user.name} fue eliminado.` });
        onDeleted?.(user);
        onChanged?.();
      }
      setPending(null);
    } catch (e) {
      const text = e instanceof Error ? e.message : 'Error desconocido';
      // Los errores de super admin y de estado se avisan en la lista; los demás, en el diálogo.
      if (kind === 'superAdmin') {
        setNotice({ ok: false, text });
        setPending(null);
      } else {
        setDialogError(text);
      }
    } finally {
      setBusy(false);
    }
  };

  const copy: Record<Pending['kind'], { title: string; confirm: string; danger?: boolean; message: (u: UserRow) => ReactNode }> = {
    superAdmin: {
      title: pending?.user.is_super_user ? 'Quitar super admin' : 'Hacer super admin',
      confirm: pending?.user.is_super_user ? 'Quitar super admin' : 'Hacer super admin',
      message: (u) =>
        u.is_super_user
          ? `${u.name} dejará de ver todas las propiedades y las herramientas de plataforma. Conserva los roles que tenga en sus propiedades.`
          : `${u.name} (${u.email}) podrá ver y administrar todas las propiedades, usuarios, cobros y exenciones. Debe cerrar sesión y volver a entrar para que aplique.`,
    },
    password: {
      title: 'Restablecer clave',
      confirm: 'Generar clave nueva',
      message: (u) => `Se reemplaza la clave actual de ${u.name} (${u.email}). La nueva solo se muestra una vez.`,
    },
    toggleActive: {
      title: pending?.user.is_active ? 'Desactivar usuario' : 'Activar usuario',
      confirm: pending?.user.is_active ? 'Desactivar' : 'Activar',
      danger: !!pending?.user.is_active,
      message: (u) => (u.is_active ? `${u.name} no podrá entrar hasta que lo vuelvas a activar. Conserva sus roles.` : `${u.name} podrá volver a entrar con su clave.`),
    },
    delete: {
      title: 'Eliminar usuario',
      confirm: 'Eliminar',
      danger: true,
      message: (u) => `Se elimina a ${u.name} y pierde todos sus accesos. Esta acción no se puede deshacer.`,
    },
  };

  const current = pending ? copy[pending.kind] : null;

  const dialogs = (
    <>
      <VtDialog
        open={!!pending}
        onClose={() => setPending(null)}
        busy={busy}
        width={460}
        eyebrow="Confirmar"
        title={current?.title ?? ''}
        footer={
          <>
            <button type="button" className={vtBtn.secondary} onClick={() => setPending(null)} disabled={busy}>Cancelar</button>
            <button
              type="button"
              className={`${vtBtn.primary} ${current?.danger ? 'bg-[#c8382d]! hover:bg-[#a82e25]!' : ''}`}
              onClick={confirm}
              disabled={busy}
            >
              {busy ? 'Un momento…' : current?.confirm}
            </button>
          </>
        }
      >
        {pending && current && <p className="m-0 text-[13px] text-[#4b4a46]">{current.message(pending.user)}</p>}
        {dialogError && <VtNotice>{dialogError}</VtNotice>}
      </VtDialog>
      <PasswordRevealDialog
        open={!!password}
        title="Clave nueva"
        email={password?.email}
        password={password?.password}
        onClose={() => setPassword(null)}
      />
    </>
  );

  const noticeBar = notice && (
    <div role="status" className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-[13px] ${notice.ok ? 'border-[#c7e3d2] bg-[#e3f1e8] text-[#1a6b3d]' : 'border-[#f1cfc4] bg-[#fbe9e4] text-[#9c3a22]'}`}>
      <span>{notice.text}</span>
      <button type="button" className="shrink-0 underline" onClick={() => setNotice(null)}>Cerrar</button>
    </div>
  );

  return { menuItems, dialogs, noticeBar, canToggleSuperAdmin };
}

/** Muestra una clave generada (al crear o restablecer): solo se ve una vez, con botones de copiar. */
export function PasswordRevealDialog({
  open,
  title,
  intro,
  email,
  password,
  onClose,
}: {
  open: boolean;
  title: string;
  intro?: ReactNode;
  email?: string;
  password?: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);
  const copy = (what: 'email' | 'password', value?: string) => {
    if (!value) return;
    void navigator.clipboard?.writeText(value);
    setCopied(what);
    setTimeout(() => setCopied(null), 2000);
  };
  const field = (label: string, value: string | undefined, what: 'email' | 'password', strong = false) => (
    <div>
      <div className="text-xs font-semibold mb-1.5">{label}</div>
      <div className="flex items-center gap-2">
        <code className={`${dsMono} flex-1 min-w-0 break-all rounded-xl px-3.5 py-2.5 text-sm ${strong ? 'bg-[#E3F5F5] text-[#0C6B76] font-semibold' : 'bg-[#f5f5f4] text-[#1a1a1a]'}`}>
          {value || '—'}
        </code>
        <button type="button" className={vtBtn.small} onClick={() => copy(what, value)} aria-label={`Copiar ${label.toLowerCase()}`}>
          {copied === what ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  );
  return (
    <VtDialog
      open={open}
      onClose={onClose}
      width={480}
      layer="over"
      title={title}
      subtitle="Cópiala ahora: solo se muestra esta vez."
      footer={<button type="button" className={vtBtn.primary} onClick={onClose}>Listo, ya la copié</button>}
    >
      {intro && <VtNotice tone="ok">{intro}</VtNotice>}
      {field('Correo', email, 'email')}
      {field('Clave', password, 'password', true)}
    </VtDialog>
  );
}
