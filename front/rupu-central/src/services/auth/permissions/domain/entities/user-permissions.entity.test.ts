import { describe, expect, it } from 'vitest';
import { permissionsAllow, votingCapabilities } from './user-permissions.entity';

const res = (resource: string, actions: string[], active = true) => ({ resource, actions, active });

const consejero = {
  isSuperAdmin: false,
  resources: [res('Votaciones', ['Read']), res('Asistencia', ['Update'])],
};

describe('permisos de Votaciones', () => {
  it('un consejero solo ve y marca asistencia', () => {
    expect(votingCapabilities(consejero)).toEqual({
      canManage: false,
      canMarkAttendance: true,
      canGeneratePasswords: false,
      canViewLive: false,
    });
  });

  it('un administrador de votaciones puede todo lo que tenga asignado', () => {
    const admin = {
      isSuperAdmin: false,
      resources: [
        res('Votaciones', ['Create', 'Read', 'Update', 'Delete']),
        res('Contraseñas de votación', ['Create']),
        res('Votación en vivo', ['Read']),
      ],
    };
    expect(votingCapabilities(admin)).toEqual({
      canManage: true,
      canMarkAttendance: true,
      canGeneratePasswords: true,
      canViewLive: true,
    });
  });

  it('el super admin lo tiene todo; sin permisos cargados, nada', () => {
    expect(Object.values(votingCapabilities({ isSuperAdmin: true, resources: [] })).every(Boolean)).toBe(true);
    expect(Object.values(votingCapabilities(null)).some(Boolean)).toBe(false);
  });

  it('un recurso inactivo o sin la acción no cuenta', () => {
    expect(permissionsAllow({ isSuperAdmin: false, resources: [res('Votaciones', ['Update'], false)] }, 'Votaciones', 'Update')).toBe(false);
    expect(permissionsAllow(consejero, 'Votaciones', 'Update')).toBe(false);
    expect(permissionsAllow(consejero, 'Votaciones')).toBe(true);
  });
});
