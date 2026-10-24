/**
 * Guía interactiva de votaciones: los 5 pasos de una asamblea en Rupü, marcados según los datos
 * reales de la asamblea en curso, con el botón para hacer el siguiente paso. Los videos viven
 * aparte, en Tutoriales (menú lateral).
 * Se puede ocultar (se recuerda por propiedad en este navegador).
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TokenStorage } from '@shared/config';
import { getVotingsAction, getVotingCoverageAction, getVotingDetailsAction } from '../../infrastructure/actions';
import { listAttendanceListsAction, getAttendanceListSummaryAction } from '../../../attendance/infrastructure/actions';
import type { VotingGroup } from '../../domain/entities';
import { VT, getGroupStatus, vtBtn } from '../design';
import { guideSteps, nextStep, type GuideFacts, type GuideStep } from './guide-steps';

interface VotingGuideProps {
  businessId: number;
  groups: VotingGroup[];
  onCreateGroup: () => void;
  onOpenGroup: (groupId: number) => void;
}

const storageKey = (businessId: number) => `rupu.votingGuide.hidden.${businessId}`;

function readHidden(businessId: number): boolean | null {
  try {
    const v = localStorage.getItem(storageKey(businessId));
    return v === null ? null : v === '1';
  } catch {
    return null;
  }
}

/** La asamblea en curso: la más reciente que no esté cerrada (o la primera). */
export function activeGroup(groups: VotingGroup[]): VotingGroup | null {
  return groups.find((g) => getGroupStatus(g).key !== 'closed') ?? groups[0] ?? null;
}

export function VotingGuide({ businessId, groups, onCreateGroup, onOpenGroup }: VotingGuideProps) {
  const group = useMemo(() => activeGroup(groups), [groups]);
  const [facts, setFacts] = useState<GuideFacts>({ groups: groups.length, votings: 0, presentUnits: 0, dayCovered: false, closedVotings: 0 });
  const [hidden, setHidden] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    const next: GuideFacts = { groups: groups.length, votings: 0, presentUnits: 0, dayCovered: false, closedVotings: 0 };
    const coverage = await getVotingCoverageAction({ token, businessId });
    const c = coverage.data;
    if (c) {
      const assembly = group ? c.assemblies.find((a) => a.groupId === group.id) : undefined;
      next.dayCovered = c.propertyExempt || c.adminExempt || !!c.membership || (assembly ? assembly.uncoveredDates.length === 0 : c.todayCovered);
    }
    if (group) {
      const votings = await getVotingsAction({ token, businessId, groupId: group.id });
      const list = votings.data ?? [];
      next.votings = list.length;
      // Cerrada = ya no está activa y recibió votos (las que nunca se iniciaron también están inactivas).
      for (const v of list.filter((x) => !x.isActive)) {
        const details = await getVotingDetailsAction({ token, businessId, votingGroupId: group.id, votingId: v.id });
        if (details.success && details.data?.units.some((u) => u.has_voted)) {
          next.closedVotings = 1;
          break;
        }
      }
      const lists = await listAttendanceListsAction({ token, businessId, votingGroupId: group.id });
      const raw = ((lists.success && lists.data) || []) as unknown as { id: number }[];
      const latest = [...raw].sort((a, b) => b.id - a.id)[0];
      if (latest) {
        const summary = await getAttendanceListSummaryAction({ token, id: latest.id });
        const data = summary.data as unknown as { attended_units?: number } | undefined;
        next.presentUnits = Number(data?.attended_units) || 0;
      }
    }
    setFacts(next);
  }, [businessId, group, groups.length]);

  useEffect(() => {
    load();
  }, [load]);

  const steps = guideSteps(facts);
  const pending = nextStep(steps);
  const doneCount = steps.filter((s) => s.done).length;

  useEffect(() => {
    const stored = readHidden(businessId);
    // Sin preferencia guardada: abierta mientras falten pasos, cerrada cuando ya está todo.
    setHidden(stored ?? (groups.length > 0 && pending === null));
  }, [businessId, groups.length, pending]);

  const setHiddenPersist = (value: boolean) => {
    setHidden(value);
    try {
      localStorage.setItem(storageKey(businessId), value ? '1' : '0');
    } catch {
      /* sin almacenamiento: solo dura esta visita */
    }
  };

  const scrollTo = (selector: string) => document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const action = (step: GuideStep) => {
    switch (step.key) {
      case 'create-group':
        return <button type="button" className={vtBtn.primary} onClick={onCreateGroup}>Crear asamblea</button>;
      case 'add-voting':
      case 'go-live':
        return group ? (
          <button type="button" className={vtBtn.primary} onClick={() => { onOpenGroup(group.id); setTimeout(() => scrollTo(`[aria-label="Grupo ${CSS.escape(group.name)}"]`), 150); }}>
            {step.key === 'add-voting' ? 'Ir a la asamblea' : 'Abrir votaciones'}
          </button>
        ) : null;
      case 'attendance':
        return group ? (
          <Link href={`/properties/${businessId}/voting-groups/${group.id}/attendance`} className={vtBtn.primary}>Abrir asistencia</Link>
        ) : null;
      case 'cover-day':
        return <button type="button" className={vtBtn.primary} onClick={() => scrollTo('[aria-label="Cobro de votaciones"]')}>Ver cómo cubrirlo</button>;
    }
  };

  if (hidden === null) return null;

  if (hidden) {
    return (
      <div className="flex">
        <button type="button" data-tour="guide" className={vtBtn.ghost} onClick={() => setHiddenPersist(false)}>
          ¿Cómo funciona? · {doneCount}/{steps.length} pasos
        </button>
      </div>
    );
  }

  return (
    <section aria-label="Guía de votaciones" data-tour="guide" className="bg-white rounded-[14px] px-4 sm:px-5 py-4 flex flex-col gap-4" style={{ border: `1px solid ${VT.border}` }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-[16px] font-semibold">Tu asamblea en Rupü, paso a paso</h2>
          <p className="m-0 mt-0.5 text-[13px]" style={{ color: VT.muted }}>
            {pending ? <>Siguiente: <strong style={{ color: VT.ink }}>{pending.title}</strong>{group ? ` · ${group.name}` : ''}</> : '¡Todo listo! Ya sabes hacer una asamblea completa.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[12px] font-semibold" aria-label={`${doneCount} de ${steps.length} pasos completos`}>{doneCount}/{steps.length}</div>
          <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: VT.border }} aria-hidden>
            <div className="h-full rounded-full transition-all" style={{ width: `${(doneCount / steps.length) * 100}%`, background: VT.reachedFg }} />
          </div>
          <button type="button" className="text-[12px] underline" style={{ color: VT.muted }} onClick={() => setHiddenPersist(true)}>Ocultar guía</button>
        </div>
      </div>

      <ol className="m-0 p-0 list-none grid gap-2.5 md:grid-cols-5" aria-label="Pasos">
        {steps.map((step, i) => {
          const current = pending?.key === step.key;
          return (
            <li
              key={step.key}
              aria-current={current ? 'step' : undefined}
              className="rounded-[10px] px-3 py-3 flex flex-col gap-2"
              style={{ border: `${current ? 2 : 1}px solid ${current ? VT.ink : VT.border}`, background: step.done ? VT.reachedBg : '#fff' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-bold shrink-0"
                  style={{ background: step.done ? VT.reachedFg : current ? VT.ink : VT.border, color: step.done || current ? '#fff' : VT.inkSoft }}
                  aria-hidden
                >
                  {step.done ? '✓' : i + 1}
                </span>
                <span className="text-[13px] font-semibold leading-tight">
                  {step.title}
                  <span className="sr-only">{step.done ? ' (hecho)' : current ? ' (siguiente)' : ''}</span>
                </span>
              </div>
              <p className="m-0 text-[12px] leading-snug" style={{ color: VT.inkSoft }}>{step.hint}</p>
              {current && <div className="mt-auto">{action(step)}</div>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
