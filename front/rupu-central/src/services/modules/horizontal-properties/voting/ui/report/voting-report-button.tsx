/**
 * "Informe PDF": descarga el informe del grupo (todas sus votaciones con resúmenes, gráficas y
 * votos por unidad). Lee los datos al momento del clic para que el informe salga al día.
 */

'use client';

import { useState } from 'react';
import { TokenStorage } from '@shared/config';
import { getVotingDetailsAction, getVotingOptionsAction } from '../../infrastructure/actions';
import type { Voting } from '../../domain/entities';
import { vtBtn } from '../design';
import { buildVotingReportPdf, toReportVoting } from './voting-report-pdf';

interface VotingReportButtonProps {
  businessId: number;
  groupId: number;
  groupName: string;
  votings: Voting[];
  propertyName?: string;
  onError: (message: string | null) => void;
}

export const reportFileName = (groupName: string, groupId: number) => {
  const slug = groupName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `informe-votaciones-${slug || groupId}.pdf`;
};

export function VotingReportButton({ businessId, groupId, groupName, votings, propertyName, onError }: VotingReportButtonProps) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    setBusy(true);
    onError(null);
    try {
      const ordered = [...votings].sort((a, b) => a.displayOrder - b.displayOrder);
      const reportVotings = await Promise.all(
        ordered.map(async (voting) => {
          const [optionsRes, detailsRes] = await Promise.all([
            getVotingOptionsAction({ token, businessId, groupId, votingId: voting.id }),
            getVotingDetailsAction({ token, businessId, votingGroupId: groupId, votingId: voting.id }),
          ]);
          if (!optionsRes.success || !detailsRes.success || !detailsRes.data) {
            throw new Error(`No se pudieron leer los resultados de "${voting.title}"`);
          }
          return toReportVoting(voting, optionsRes.data ?? [], detailsRes.data.units);
        }),
      );
      const doc = await buildVotingReportPdf({ groupName, propertyName, generatedAt: new Date(), votings: reportVotings });
      doc.save(reportFileName(groupName, groupId));
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo generar el informe');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" className={vtBtn.small} onClick={download} disabled={busy || votings.length === 0}>
      {busy ? 'Generando informe…' : 'Informe PDF'}
    </button>
  );
}
