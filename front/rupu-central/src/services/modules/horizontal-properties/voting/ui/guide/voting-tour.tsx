/**
 * Recorrido guiado de Votaciones para quien llega por primera vez: muestra, sobre la pantalla real,
 * dónde se crea la asamblea, la guía de pasos, la asistencia y el QR, cómo se cubre el día y dónde
 * están los tutoriales. Aparece solo una vez por navegador; se repite con "Recorrido guiado".
 */

'use client';

import { VT } from '../design';
import { ProductTour, type TourStep } from './product-tour';

export const VOTING_TOUR_KEY = 'rupu.tour.votaciones.v1';

export function votingTourSeen(): boolean {
  try {
    return localStorage.getItem(VOTING_TOUR_KEY) === 'done';
  } catch {
    return true; // sin almacenamiento no se insiste en cada visita
  }
}

export function markVotingTourSeen() {
  try {
    localStorage.setItem(VOTING_TOUR_KEY, 'done');
  } catch {
    /* solo dura esta visita */
  }
}

const FLOW = ['Asamblea', 'Votaciones', 'Asistencia y QR', 'Resultados'];

export const VOTING_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    eyebrow: 'Bienvenido a Rupü',
    title: 'Así se hace una votación de asamblea',
    body: (
      <div className="flex flex-col gap-3">
        <p className="m-0">En un minuto te mostramos dónde está cada cosa. Puedes salir cuando quieras y repetirlo desde «Recorrido guiado».</p>
        <ol className="m-0 p-0 list-none flex flex-wrap items-center gap-1.5 text-[12px] font-semibold" aria-label="El flujo de una asamblea">
          {FLOW.map((f, i) => (
            <li key={f} className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: VT.reachedBg, color: VT.reachedFg }}>
                <span aria-hidden>{i + 1}</span> {f}
              </span>
              {i < FLOW.length - 1 && <span aria-hidden style={{ color: VT.muted }}>→</span>}
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    id: 'new-group',
    target: '[data-tour="new-group"]',
    missing: 'skip',
    title: 'Crea la asamblea',
    body: 'Cada asamblea es un grupo de votación. Le pones nombre, fecha y hora, y el quórum (viene en 51 % de los coeficientes).',
  },
  {
    id: 'guide',
    target: '[data-tour="guide"]',
    missing: 'skip',
    title: 'Tu guía paso a paso',
    body: 'Aquí ves qué llevas hecho y cuál es el siguiente paso, con un botón para hacerlo. Cada paso tiene un video corto con voz.',
  },
  {
    id: 'group-actions',
    target: '[data-tour="group-actions"]',
    missing: 'skip',
    title: 'Asistencia y código QR',
    body: 'Con el QR los propietarios votan desde el celular, sin instalar nada. En Asistencia marcas quién llegó (solo vota quien tenga asistencia) y descargas el PDF con la contraseña de cada unidad.',
  },
  {
    id: 'coverage',
    target: '[data-tour="coverage"]',
    missing: 'skip',
    title: 'Cubre el día de la votación',
    body: 'Para recibir votos, el día de la asamblea debe estar cubierto: un día suelto ($50.000), el mes ilimitado ($200.000) o un plan de administradora. Pagas con Nequi, PSE o tarjeta.',
  },
  {
    id: 'tutorials',
    target: '[data-tour="tutorials"]',
    missing: 'skip',
    title: 'Tutoriales siempre a la mano',
    body: 'Aquí están los 6 videos: desde crear la asamblea hasta descargar el informe para el acta.',
  },
  {
    id: 'done',
    eyebrow: '¡Listo!',
    title: 'Ya sabes hacer tu asamblea',
    body: 'Empieza creando la asamblea; la guía te va diciendo lo que sigue. Si te pierdes, vuelve a «Recorrido guiado» o a Tutoriales.',
  },
];

export function VotingTour({ open, onClose, onCreateGroup, hasGroups }: { open: boolean; onClose: () => void; onCreateGroup: () => void; hasGroups: boolean }) {
  const close = () => {
    markVotingTourSeen();
    onClose();
  };
  return (
    <ProductTour
      steps={VOTING_TOUR_STEPS}
      open={open}
      onClose={close}
      label="Recorrido guiado de votaciones"
      finishLabel={hasGroups ? 'Entendido' : 'Crear mi asamblea'}
      onFinish={hasGroups ? undefined : onCreateGroup}
    />
  );
}
