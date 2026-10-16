'use client';

import { useState } from 'react';
import { VtDialog, VtNotice, VtIcon, vtBtn, vtInput, vtLabel, dsMono } from '@/shared/ui/ds';
import { registerAssetsAction } from '../infrastructure/actions';
import { CreateVisitAssetDTO } from '../domain';
import { useBusinessToken } from './use-business-token';

interface RegisterAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  visitId: number;
  businessId: number;
}

interface AssetForm {
  assetName: string;
  assetDescription: string;
  assetSerial: string;
  assetBrand: string;
}

const emptyAsset: AssetForm = {
  assetName: '',
  assetDescription: '',
  assetSerial: '',
  assetBrand: '',
};

export function RegisterAssetsModal({
  isOpen,
  onClose,
  onSuccess,
  visitId,
  businessId,
}: RegisterAssetsModalProps) {
  const [assets, setAssets] = useState<AssetForm[]>([{ ...emptyAsset }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBusinessToken = useBusinessToken(businessId);

  const handleAddAsset = () => {
    setAssets([...assets, { ...emptyAsset }]);
  };

  const handleRemoveAsset = (index: number) => {
    if (assets.length > 1) {
      setAssets(assets.filter((_, i) => i !== index));
    }
  };

  const handleAssetChange = (index: number, field: keyof AssetForm, value: string) => {
    const newAssets = [...assets];
    newAssets[index] = { ...newAssets[index], [field]: value };
    setAssets(newAssets);
  };

  const handleSubmit = async () => {
    // Validar que al menos un activo tenga nombre
    const validAssets = assets.filter((a) => a.assetName.trim() !== '');
    if (validAssets.length === 0) {
      setError('Debe agregar al menos un activo con nombre');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getBusinessToken();
      const assetsDTO: CreateVisitAssetDTO[] = validAssets.map((a) => ({
        assetName: a.assetName.trim(),
        assetDescription: a.assetDescription.trim() || undefined,
        assetSerial: a.assetSerial.trim() || undefined,
        assetBrand: a.assetBrand.trim() || undefined,
      }));

      await registerAssetsAction({
        businessId,
        visitId,
        data: { assets: assetsDTO },
        token,
      });

      // Limpiar y cerrar
      setAssets([{ ...emptyAsset }]);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error registrando activos');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAssets([{ ...emptyAsset }]);
    setError(null);
    onClose();
  };

  const field = (index: number, key: keyof AssetForm, label: string, required = false) => (
    <div>
      <label htmlFor={`asset-${index}-${key}`} className={vtLabel}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input id={`asset-${index}-${key}`} className={vtInput} value={assets[index][key]} onChange={(e) => handleAssetChange(index, key, e.target.value)} />
    </div>
  );

  return (
    <VtDialog
      open={isOpen}
      onClose={handleClose}
      busy={loading}
      layer="over"
      eyebrow="Visita"
      title="Equipos que ingresa"
      subtitle="Herramientas o equipos que se revisan a la salida"
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={handleClose} disabled={loading}>
            Cancelar
          </button>
          <button type="button" className={vtBtn.primary} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Registrando…' : 'Registrar equipos'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {error && <VtNotice tone="error">{error}</VtNotice>}
        <div className="flex flex-col gap-3 max-h-[50dvh] overflow-y-auto">
          {assets.map((_, index) => (
            <div key={index} className="rounded-lg border border-[#e4e2dd] p-3.5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className={`${dsMono} text-[10px] font-medium tracking-[.06em] uppercase text-[#8a8580]`}>Equipo {index + 1}</span>
                {assets.length > 1 && (
                  <button type="button" className={vtBtn.icon} onClick={() => handleRemoveAsset(index)} aria-label={`Quitar equipo ${index + 1}`}>
                    <VtIcon name="trash" size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {field(index, 'assetName', 'Nombre', true)}
                {field(index, 'assetBrand', 'Marca')}
                {field(index, 'assetSerial', 'Serial')}
                {field(index, 'assetDescription', 'Descripción')}
              </div>
            </div>
          ))}
        </div>
        <button type="button" className={vtBtn.secondary} onClick={handleAddAsset}>
          + Agregar otro equipo
        </button>
      </div>
    </VtDialog>
  );
}
