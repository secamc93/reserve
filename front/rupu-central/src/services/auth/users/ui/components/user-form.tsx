/**
 * Crear o editar un usuario (rediseño IAM 2d).
 *
 * Al crear: datos, propiedad y el rol que tendrá allí (tarjetas con la descripción de cada rol).
 * El back genera la clave y la devuelve una sola vez; si se eligió rol, se asigna enseguida
 * (el alta no devuelve el id, así que se busca al usuario por su correo).
 * Al editar: datos, propiedades a las que pertenece y si está activo. Los roles se cambian
 * desde "Cambiar roles".
 */

'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { VtDialog, VtNotice, VtSwitch, vtBtn, vtInput, vtLabel } from '@shared/ui/ds';
import { getBusinessesAction } from '@/services/auth/businesses/infrastructure/actions';
import { getRolesAction } from '@/services/auth/roles/infrastructure/actions';
import { assignUserRoleAction, getUsersAction } from '../../infrastructure/actions';
import { useUserCrud } from '../hooks/use-user-crud';
import { PasswordRevealDialog, type UserRow } from './user-actions';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Usuario a editar; sin él, se crea uno nuevo. */
  user?: UserRow | null;
  mode: 'create' | 'edit';
}

interface BusinessOption {
  id: number;
  name: string;
  businessTypeId: number;
}

interface RoleOption {
  id: number;
  name: string;
  description: string;
}

const EMPTY = { name: '', email: '', phone: '', is_active: true };

export function validateUserForm(data: { name: string; email: string; phone: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = 'Escribe el nombre';
  if (!data.email.trim()) errors.email = 'Escribe el correo';
  else if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) errors.email = 'El correo no es válido';
  if (data.phone.trim() && data.phone.replace(/\D/g, '').length !== 10) errors.phone = 'El celular debe tener 10 dígitos';
  return errors;
}

export function UserForm({ isOpen, onClose, onSuccess, user, mode }: UserFormProps) {
  const ids = { name: useId(), email: useId(), phone: useId(), business: useId(), avatar: useId() };
  const [form, setForm] = useState(EMPTY);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  // Crear: una propiedad y un rol. Editar: varias propiedades.
  const [businessId, setBusinessId] = useState<number | ''>('');
  const [roleId, setRoleId] = useState<number | null>(null);
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<number[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [created, setCreated] = useState<{ email?: string; password?: string; note?: string } | null>(null);
  const [assigning, setAssigning] = useState(false);

  const { createUser, updateUser, loading, error, clearError } = useUserCrud();

  useEffect(() => {
    if (!isOpen) return;
    clearError();
    setErrors({});
    setAvatarFile(null);
    setRoleId(null);
    setBusinessId('');
    if (mode === 'edit' && user) {
      setForm({ name: user.name ?? '', email: user.email ?? '', phone: user.phone ?? '', is_active: user.is_active ?? true });
      const fromRoles = (user.business_role_assignments ?? []).map((a) => a.business_id);
      const fromBusinesses = (user.businesses ?? []).map((b) => b.id);
      setSelectedBusinessIds([...new Set([...fromRoles, ...fromBusinesses])].filter((id) => id > 0));
    } else {
      setForm(EMPTY);
      setSelectedBusinessIds([]);
    }
  }, [isOpen, mode, user, clearError]);

  useEffect(() => {
    if (!isOpen) return;
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    getBusinessesAction({ token, page: 1, per_page: 200, name: '' }).then((res) => {
      if (res.success && res.data) {
        setBusinesses(res.data.businesses.map((b) => ({ id: b.id, name: b.name, businessTypeId: b.business_type_id })));
      }
    });
  }, [isOpen]);

  const selectedBusiness = useMemo(() => businesses.find((b) => b.id === businessId), [businesses, businessId]);

  useEffect(() => {
    setRoleId(null);
    setRoles([]);
    const token = TokenStorage.getBusinessToken();
    if (!selectedBusiness || !token) return;
    setRolesLoading(true);
    getRolesAction(token, { business_type_id: selectedBusiness.businessTypeId, page_size: 200 })
      .then((res) => {
        if (res.success && res.data) setRoles(res.data.roles.map((r) => ({ id: r.id, name: r.name, description: r.description })));
      })
      .finally(() => setRolesLoading(false));
  }, [selectedBusiness]);

  const set = (field: keyof typeof EMPTY, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const finishCreate = () => {
    setCreated(null);
    onSuccess();
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateUserForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken() || '';
    const base = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      avatarFile,
      token,
    };

    if (mode === 'edit' && user) {
      const ok = await updateUser({ ...base, id: user.id, is_active: form.is_active, business_ids: selectedBusinessIds.join(',') });
      if (ok) {
        onSuccess();
        onClose();
      }
      return;
    }

    const result = await createUser({ ...base, is_active: true, business_ids: businessId ? String(businessId) : undefined });
    if (!result.success) return;
    let note: string | undefined;
    if (businessId && roleId) {
      setAssigning(true);
      note = await assignRoleByEmail(token, base.email, businessId, roleId);
      setAssigning(false);
    }
    setCreated({ email: result.data?.email ?? base.email, password: result.data?.password, note });
  };

  const busy = loading || assigning;
  const addableBusinesses = businesses.filter((b) => !selectedBusinessIds.includes(b.id));
  const businessName = (id: number) =>
    businesses.find((b) => b.id === id)?.name ??
    user?.business_role_assignments?.find((a) => a.business_id === id)?.business_name ??
    `Propiedad ${id}`;

  return (
    <>
      <VtDialog
        open={isOpen && !created}
        onClose={onClose}
        busy={busy}
        title={mode === 'create' ? 'Crear usuario' : 'Editar usuario'}
        subtitle={mode === 'create' ? 'Se genera una clave que le compartes; podrá cambiarla al entrar.' : user?.email}
        footer={
          <>
            <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={busy}>Cancelar</button>
            <button type="submit" form="user-form" className={vtBtn.primary} disabled={busy}>
              {busy ? 'Guardando…' : mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label htmlFor={ids.name} className={vtLabel}>Nombre completo</label>
              <input id={ids.name} className={vtInput} value={form.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} autoComplete="off" />
              {errors.name && <p className="mt-1 text-xs text-[#c8382d]">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor={ids.email} className={vtLabel}>Correo</label>
              <input id={ids.email} type="email" className={vtInput} value={form.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} autoComplete="off" />
              {errors.email && <p className="mt-1 text-xs text-[#c8382d]">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor={ids.phone} className={vtLabel}>
                Celular <span className="font-normal text-[#6b6660]">(opcional)</span>
              </label>
              <input id={ids.phone} type="tel" inputMode="numeric" placeholder="300 000 0000" className={vtInput} value={form.phone} onChange={(e) => set('phone', e.target.value)} aria-invalid={!!errors.phone} />
              {errors.phone && <p className="mt-1 text-xs text-[#c8382d]">{errors.phone}</p>}
            </div>
          </div>

          {mode === 'create' ? (
            <>
              <div>
                <label htmlFor={ids.business} className={vtLabel}>
                  Propiedad <span className="font-normal text-[#6b6660]">(opcional)</span>
                </label>
                <select id={ids.business} className={vtInput} value={businessId} onChange={(e) => setBusinessId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Sin propiedad por ahora</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              {selectedBusiness && (
                <fieldset className="border-0 m-0 p-0 flex flex-col gap-2">
                  <legend className={vtLabel}>¿Qué rol tendrá en {selectedBusiness.name}?</legend>
                  {rolesLoading && <div className="text-[13px] text-[#8a8580]">Cargando roles…</div>}
                  {!rolesLoading && roles.length === 0 && (
                    <div className="text-[13px] text-[#8a8580]">No hay roles para este tipo de propiedad. Créalo en Roles y permisos.</div>
                  )}
                  {roles.map((r) => {
                    const on = r.id === roleId;
                    return (
                      <label
                        key={r.id}
                        className={`flex gap-3 items-start px-3.5 py-3 rounded-xl cursor-pointer border transition-colors ${on ? 'border-[#0F7F8A] bg-[#f2fafa]' : 'border-[#e4e2dd] bg-white hover:bg-[#faf9f7]'}`}
                      >
                        <input type="radio" name="rol" checked={on} onChange={() => setRoleId(r.id)} className="mt-0.5 w-[18px] h-[18px] accent-[#0F7F8A]" />
                        <span className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold">{r.name}</span>
                          {r.description && <span className="text-[13px] text-[#4b4a46]">{r.description}</span>}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              )}
            </>
          ) : (
            <>
              <div>
                <span className={vtLabel}>Propiedades</span>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedBusinessIds.length === 0 && <span className="text-[13px] text-[#8a8580]">No pertenece a ninguna propiedad.</span>}
                  {selectedBusinessIds.map((id) => (
                    <span key={id} className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full bg-[#f0eeeb] text-[13px]">
                      {businessName(id)}
                      <button
                        type="button"
                        aria-label={`Quitar ${businessName(id)}`}
                        onClick={() => setSelectedBusinessIds((prev) => prev.filter((x) => x !== id))}
                        className="w-6 h-6 max-md:w-9 max-md:h-9 rounded-full inline-flex items-center justify-center text-[#6b6660] hover:bg-white"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                {addableBusinesses.length > 0 && (
                  <select
                    aria-label="Agregar propiedad"
                    className={vtInput}
                    value=""
                    onChange={(e) => e.target.value && setSelectedBusinessIds((prev) => [...prev, Number(e.target.value)])}
                  >
                    <option value="">+ Agregar propiedad</option>
                    {addableBusinesses.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e4e2dd] px-3.5 py-3">
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">Puede entrar</span>
                  <span className="text-[13px] text-[#4b4a46]">Si lo apagas, no podrá iniciar sesión.</span>
                </span>
                <VtSwitch checked={form.is_active} onChange={(v) => set('is_active', v)} label="Puede entrar" />
              </div>
            </>
          )}

          <div>
            <label htmlFor={ids.avatar} className={vtLabel}>
              Foto <span className="font-normal text-[#6b6660]">(opcional)</span>
            </label>
            <input id={ids.avatar} type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} className="block w-full text-[13px] text-[#4b4a46] file:mr-3 file:h-9 file:px-3.5 file:rounded-full file:border file:border-[#e4e2dd] file:bg-white file:text-[13px] file:font-medium" />
          </div>

          {error && <VtNotice>{error}</VtNotice>}
        </form>
      </VtDialog>

      <PasswordRevealDialog
        open={!!created}
        title="Usuario creado"
        intro={created?.note ?? 'Compártele su correo y esta clave para que entre a Rupü.'}
        email={created?.email}
        password={created?.password}
        onClose={finishCreate}
      />
    </>
  );
}

/** Asigna el rol al usuario recién creado. Devuelve un aviso si no se pudo. */
async function assignRoleByEmail(token: string, email: string, businessId: number, roleId: number): Promise<string | undefined> {
  const fail = 'Se creó el usuario, pero no se pudo asignar el rol. Asígnalo desde su ficha con "Cambiar roles".';
  const found = await getUsersAction({ token, email, page: 1, page_size: 10 });
  const created = found.success ? found.data?.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) : undefined;
  if (!created) return fail;
  const assigned = await assignUserRoleAction({ token, user_id: created.id, assignments: [{ business_id: businessId, role_id: roleId }] });
  return assigned.success ? undefined : fail;
}
