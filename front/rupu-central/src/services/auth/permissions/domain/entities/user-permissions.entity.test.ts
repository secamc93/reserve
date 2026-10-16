import { describe, expect, it } from 'vitest';
import { VOTING_PASSWORDS_RESOURCE, permissionsInclude } from './user-permissions.entity';

const consejero = {
  isSuperAdmin: false,
  resources: [{ resource: 'Votaciones', actions: ['Read'], active: true }],
};

describe('permissionsInclude', () => {
  it('un consejero (solo Votaciones) no puede generar contraseñas', () => {
    expect(permissionsInclude(consejero, VOTING_PASSWORDS_RESOURCE)).toBe(false);
  });

  it('con el recurso activo sí; inactivo no', () => {
    const con = (active: boolean) => ({
      isSuperAdmin: false,
      resources: [...consejero.resources, { resource: VOTING_PASSWORDS_RESOURCE, actions: ['Create'], active }],
    });
    expect(permissionsInclude(con(true), VOTING_PASSWORDS_RESOURCE)).toBe(true);
    expect(permissionsInclude(con(false), VOTING_PASSWORDS_RESOURCE)).toBe(false);
  });

  it('el super admin lo tiene todo; sin permisos cargados, nada', () => {
    expect(permissionsInclude({ isSuperAdmin: true, resources: [] }, VOTING_PASSWORDS_RESOURCE)).toBe(true);
    expect(permissionsInclude(null, VOTING_PASSWORDS_RESOURCE)).toBe(false);
  });
});
