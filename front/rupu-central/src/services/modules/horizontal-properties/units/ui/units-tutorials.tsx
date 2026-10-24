/**
 * Tutoriales de Unidades: cómo cargar las unidades con su coeficiente (la base del quórum y del
 * peso de cada voto) y cómo corregirlas.
 */

'use client';

import { TutorialsPage, type TutorialItem } from '@shared/ui/tutorials-page';

export function unitsTutorialItems(businessId: number): TutorialItem[] {
  const units = `/properties/${businessId}/units`;
  return [
    {
      slug: 'unidades-importar',
      title: 'Importar unidades desde Excel',
      points: [
        'Columnas: Número, Torre, Piso, Tipo y Coeficiente. Número y coeficiente son obligatorios.',
        'Primero se revisa el archivo: nada se guarda hasta que confirmas.',
        'Los coeficientes deben sumar 100 %: son el peso de cada voto y la base del quórum.',
      ],
      video: '/tutoriales/unidades-importar.mp4',
      poster: '/tutoriales/unidades-importar.jpg',
      action: { href: units, label: 'Ir a Unidades' },
    },
    {
      slug: 'unidades-corregir',
      title: 'Corregir una unidad y su coeficiente',
      points: [
        'Busca la unidad y ábrela para editar número, piso o coeficiente.',
        'Usa el coeficiente del reglamento de propiedad horizontal o la escritura.',
        'Revisa que el total siga en 100 % antes de la asamblea.',
      ],
      video: '/tutoriales/unidades-corregir.mp4',
      poster: '/tutoriales/unidades-corregir.jpg',
      action: { href: units, label: 'Ir a Unidades' },
    },
  ];
}

export function UnitsTutorials({ businessId }: { businessId: number }) {
  return (
    <TutorialsPage
      heading="Tutoriales de Unidades"
      intro="Las unidades y sus coeficientes son la base de cada asamblea: con ellos se calcula el quórum y el peso de cada voto. Aquí ves cómo cargarlas bien."
      backHref={`/properties/${businessId}/units`}
      items={unitsTutorialItems(businessId)}
    />
  );
}
