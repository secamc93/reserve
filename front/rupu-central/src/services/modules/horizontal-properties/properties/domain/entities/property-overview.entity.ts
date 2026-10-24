/**
 * Resumen de una propiedad para su tarjeta en "Elige una propiedad": datos generales, unidades,
 * suma de coeficientes (debe ser 100 % para que quórum y resultados sean correctos) y residentes.
 */

export interface PropertyOverview {
  id: number;
  address: string;
  description: string;
  units: number;
  coefficientSum: number;
  residents: number;
  owners: number;
  tenants: number;
}
