import { describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { businessTypeCode } from './business-types-admin-page';

describe('businessTypeCode', () => {
  it('quita tildes, espacios y símbolos', () => {
    expect(businessTypeCode('Propiedad Horizontal')).toBe('propiedad_horizontal');
    expect(businessTypeCode('  Gimnasio & Spa ')).toBe('gimnasio_spa');
    expect(businessTypeCode('Clínica Médica')).toBe('clinica_medica');
  });
});
