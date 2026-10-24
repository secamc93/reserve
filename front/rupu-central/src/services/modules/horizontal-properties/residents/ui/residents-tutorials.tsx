/**
 * Tutoriales de Residentes: cómo importarlos emparejándolos con sus unidades y cómo completar sus
 * datos (tipo, correo, teléfono).
 */

'use client';

import { TutorialsPage, type TutorialItem } from '@shared/ui/tutorials-page';

export function residentsTutorialItems(businessId: number): TutorialItem[] {
  const residents = `/properties/${businessId}/residents`;
  return [
    {
      slug: 'residentes-importar',
      title: 'Importar residentes desde Excel',
      points: [
        'Primero carga las unidades: cada residente se empareja con su unidad por el número exacto.',
        'Descarga el Excel de ejemplo desde Importar Excel: unidad, nombre completo y documento.',
        'Las filas con una unidad que no existe se muestran como error: corrige el número y vuelve a importar.',
      ],
      video: '/tutoriales/residentes-importar.mp4',
      poster: '/tutoriales/residentes-importar.jpg',
      action: { href: residents, label: 'Ir a Residentes' },
    },
    {
      slug: 'residentes-completar',
      title: 'Completar los datos de los residentes',
      points: [
        'Edición masiva: corrige nombres, documentos, correos y teléfonos de una torre en una tabla.',
        'La importación crea a todos como Propietario: cambia a Arrendatario o Familiar editando al residente.',
        'Con nombres y documentos correctos, las credenciales y el acta quedan a nombre de quien es.',
      ],
      video: '/tutoriales/residentes-completar.mp4',
      poster: '/tutoriales/residentes-completar.jpg',
      action: { href: residents, label: 'Ir a Residentes' },
    },
  ];
}

export function ResidentsTutorials({ businessId }: { businessId: number }) {
  return (
    <TutorialsPage
      heading="Tutoriales de Residentes"
      intro="Los residentes le ponen nombre a cada unidad: aparecen en las credenciales de votación, en la asistencia y en el acta. Aquí ves cómo cargarlos y emparejarlos con sus unidades."
      backHref={`/properties/${businessId}/residents`}
      items={residentsTutorialItems(businessId)}
    />
  );
}
