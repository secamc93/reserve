/**
 * Pasos de la guía de votaciones y cuáles están hechos según los datos de la asamblea en curso.
 */

export interface GuideFacts {
  groups: number;
  votings: number;
  presentUnits: number;
  dayCovered: boolean;
  closedVotings: number;
}

export type StepAction = 'create-group' | 'add-voting' | 'attendance' | 'cover-day' | 'go-live';

export interface GuideStep {
  key: StepAction;
  title: string;
  hint: string;
  done: boolean;
}

export function guideSteps(f: GuideFacts): GuideStep[] {
  return [
    { key: 'create-group', title: 'Crea la asamblea', hint: 'Nombre, fecha y quórum.', done: f.groups > 0 },
    { key: 'add-voting', title: 'Agrega las votaciones', hint: 'Una por cada punto del orden del día.', done: f.votings > 0 },
    { key: 'attendance', title: 'Asistencia y QR', hint: 'Marca quién llegó y comparte el QR.', done: f.presentUnits > 0 },
    { key: 'cover-day', title: 'Cubre el día de votación', hint: 'Día suelto, mes o plan.', done: f.dayCovered },
    { key: 'go-live', title: 'Vota en vivo', hint: 'Resultados al instante e informe PDF.', done: f.closedVotings > 0 },
  ];
}

/** El siguiente paso por hacer (el primero pendiente), o null si ya está todo. */
export function nextStep(steps: GuideStep[]): GuideStep | null {
  return steps.find((s) => !s.done) ?? null;
}
