import { describe, expect, it } from 'vitest';
import { hasNoRole, isStale, lastAccessLabel, roleAssignmentsOf, summarizeUsers } from './users-overview.entity';

const now = new Date(2026, 9, 23, 15, 0);
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

const user = (over: Record<string, unknown> = {}) => ({
  id: 1,
  name: 'Laura',
  is_active: true,
  is_super_user: false,
  last_login_at: undefined as string | undefined,
  created_at: daysAgo(10),
  business_role_assignments: [] as Array<{ business_id: number; business_name?: string; role_id: number; role_name: string }>,
  ...over,
});

describe('lastAccessLabel', () => {
  it('habla en días, semanas y meses', () => {
    expect(lastAccessLabel(undefined, now)).toBe('Nunca');
    expect(lastAccessLabel(new Date(2026, 9, 23, 9, 42).toISOString(), now)).toMatch(/^Hoy, 9:42/);
    expect(lastAccessLabel(new Date(2026, 9, 22, 23, 0).toISOString(), now)).toBe('Ayer');
    expect(lastAccessLabel(daysAgo(3), now)).toBe('Hace 3 días');
    expect(lastAccessLabel(daysAgo(15), now)).toBe('Hace 2 semanas');
    expect(lastAccessLabel(daysAgo(125), now)).toBe('Hace 4 meses');
    expect(lastAccessLabel(daysAgo(800), now)).toBe('Hace 2 años');
  });
});

describe('roles y atención', () => {
  it('sin rol = ni super admin ni rol en una propiedad', () => {
    expect(hasNoRole(user())).toBe(true);
    expect(hasNoRole(user({ is_super_user: true }))).toBe(false);
    expect(hasNoRole(user({ business_role_assignments: [{ business_id: 3, role_id: 2, role_name: 'Portería' }] }))).toBe(false);
    expect(roleAssignmentsOf(user({ business_role_assignments: [{ business_id: 3, role_id: 2, role_name: 'Portería' }] }))[0].businessName).toBe('Propiedad 3');
  });

  it('sin uso: activa y sin entrar en 90 días (o nunca, si se creó hace más)', () => {
    expect(isStale(user({ last_login_at: daysAgo(91) }), now)).toBe(true);
    expect(isStale(user({ last_login_at: daysAgo(10) }), now)).toBe(false);
    expect(isStale(user({ created_at: daysAgo(120) }), now)).toBe(true);
    expect(isStale(user({ created_at: daysAgo(120), is_active: false }), now)).toBe(false);
  });

  it('agrupa accesos por propiedad, de la más poblada a la menos', () => {
    const o = summarizeUsers(
      [
        user({ id: 1, business_role_assignments: [{ business_id: 7, business_name: 'Tayazal', role_id: 1, role_name: 'Administrador' }] }),
        user({ id: 2, business_role_assignments: [{ business_id: 7, business_name: 'Tayazal', role_id: 2, role_name: 'Portería' }, { business_id: 9, business_name: 'Altos', role_id: 2, role_name: 'Portería' }] }),
        user({ id: 3, business_role_assignments: [{ business_id: 7, business_name: 'Tayazal', role_id: 2, role_name: 'Portería' }] }),
        user({ id: 4 }),
        user({ id: 5, is_super_user: true, is_active: false }),
      ],
      now,
    );
    expect(o.withoutRole.map((u) => u.id)).toEqual([4]);
    expect(o.inactive).toBe(1);
    expect(o.superAdmins).toBe(1);
    expect(o.byProperty).toEqual([
      { businessId: 7, businessName: 'Tayazal', total: 3, roles: [{ roleName: 'Portería', count: 2 }, { roleName: 'Administrador', count: 1 }] },
      { businessId: 9, businessName: 'Altos', total: 1, roles: [{ roleName: 'Portería', count: 1 }] },
    ]);
  });
});
