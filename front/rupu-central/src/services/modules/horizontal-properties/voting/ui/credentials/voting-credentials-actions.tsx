/**
 * Botones de la lista de asistencia para las contraseñas de voto del grupo:
 *  - "Generar contraseñas": una contraseña aleatoria por unidad (solo a las que no tienen).
 *    Si ya todas tienen, ofrece regenerarlas (las impresas antes dejan de servir).
 *  - "Credenciales PDF": una tarjeta por unidad con el QR del grupo, la unidad, el propietario
 *    y su contraseña, para entregarla en la mesa de asistencia.
 * Desde que el grupo tiene contraseñas, el voto público por QR exige la de la unidad.
 */

'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { ConfirmModal } from '@shared/ui/confirm-modal';
import { fetchAllPages } from '@shared/utils/pagination';
import {
  generateVotingCredentialsAction,
  listVotingCredentialsAction,
} from '../../infrastructure/actions/voting-credentials.action';
import { generateGroupPublicUrlAction } from '../../infrastructure/actions/public-voting/generate-group-public-url.action';
import { buildCredentialsPdf } from './credentials-pdf';
import { vtBtn } from '@shared/ui/ds';

/** El QR impreso se entrega antes de la asamblea: el enlace dura 30 días. */
const QR_DURATION_HOURS = 24 * 30;

interface VotingCredentialsActionsProps {
  token: string;
  businessId: number;
  groupId: number;
  propertyName?: string;
}

export function VotingCredentialsActions({ token, businessId, groupId, propertyName }: VotingCredentialsActionsProps) {
  const [busy, setBusy] = useState<'generate' | 'pdf' | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const generate = async (regenerate: boolean) => {
    setBusy('generate');
    setMessage(null);
    try {
      const res = await generateVotingCredentialsAction({ token, businessId, groupId, regenerate });
      if (!res.success || !res.data) {
        setMessage({ kind: 'error', text: res.error || 'No se pudieron generar las contraseñas' });
        return;
      }
      const { generated, total } = res.data;
      if (generated === 0 && !regenerate) {
        setMessage({ kind: 'ok', text: `Las ${total} unidades ya tienen contraseña. Puede descargar el PDF.` });
        setConfirmRegenerate(true);
        return;
      }
      setMessage({
        kind: 'ok',
        text: regenerate
          ? `Se regeneraron las ${total} contraseñas. Imprima de nuevo las credenciales.`
          : `Se generaron ${generated} contraseñas (${total} unidades con contraseña). Ya puede descargar el PDF.`,
      });
    } finally {
      setBusy(null);
    }
  };

  const downloadPdf = async () => {
    setBusy('pdf');
    setMessage(null);
    try {
      const cards = await fetchAllPages((page, pageSize) =>
        listVotingCredentialsAction({ token, businessId, groupId, page, pageSize }).then((r) => {
          if (!r.success || !r.data) throw new Error(r.error || 'No se pudieron obtener las contraseñas');
          return { items: r.data.credentials, total: r.data.total, totalPages: r.data.totalPages };
        }),
      );
      if (cards.length === 0) {
        setMessage({ kind: 'error', text: 'Primero genere las contraseñas del grupo.' });
        return;
      }
      const url = await generateGroupPublicUrlAction({ token, businessId, groupId, durationHours: QR_DURATION_HOURS });
      if (!url.success || !url.data?.public_url) {
        setMessage({ kind: 'error', text: url.error || 'No se pudo generar el enlace del código QR' });
        return;
      }
      const qrDataUrl = await QRCode.toDataURL(url.data.public_url, { margin: 1, width: 360, errorCorrectionLevel: 'M' });
      const groupName = url.data.group_name || 'Asamblea';
      const doc = await buildCredentialsPdf({
        groupName,
        propertyName,
        publicUrl: url.data.public_url,
        qrDataUrl,
        cards,
      });
      const slug = groupName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      doc.save(`credenciales-${slug || groupId}.pdf`);
      setMessage({ kind: 'ok', text: `PDF con ${cards.length} credenciales descargado.` });
    } catch (e) {
      setMessage({ kind: 'error', text: e instanceof Error ? e.message : 'No se pudo generar el PDF' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 max-md:[&>button]:flex-1">
        <button
          type="button"
          onClick={() => generate(false)}
          disabled={busy !== null}
          className={vtBtn.secondary}
          title="Generar una contraseña aleatoria por unidad para este grupo de votación"
        >
          {busy === 'generate' ? 'Generando…' : 'Generar contraseñas'}
        </button>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={busy !== null}
          className={vtBtn.primary}
          title="PDF con el código QR, la unidad, el propietario y la contraseña de cada unidad"
        >
          {busy === 'pdf' ? 'Armando PDF…' : 'Descargar PDF con QR'}
        </button>
      </div>
      {message && (
        <p role="status" className={`text-[13px] ${message.kind === 'ok' ? 'text-[#2f6b4f]' : 'text-[#b4432b]'}`}>
          {message.text}
        </p>
      )}
      <ConfirmModal
        isOpen={confirmRegenerate}
        onClose={() => setConfirmRegenerate(false)}
        onConfirm={() => generate(true)}
        title="Las unidades ya tienen contraseña"
        message="¿Regenerar todas? Las credenciales que ya se imprimieron o entregaron dejarán de servir."
        confirmText="Regenerar todas"
        cancelText="Conservar las actuales"
        type="warning"
      />
    </div>
  );
}
