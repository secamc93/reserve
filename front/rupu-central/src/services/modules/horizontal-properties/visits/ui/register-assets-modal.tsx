'use client';

import { useState } from 'react';
import { Modal, Button, Input, Alert } from '@shared/ui';
import { registerAssetsAction } from '../infrastructure/actions';
import { CreateVisitAssetDTO } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

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

  const getBusinessToken = async (): Promise<string> => {
    let businessToken = TokenStorage.getBusinessToken();
    if (businessToken) return businessToken;

    const sessionToken = TokenStorage.getSessionToken();
    if (!sessionToken) throw new Error('No session token available');

    const user = TokenStorage.getUser();
    const isSuperAdmin = user?.is_super_admin;
    const business_id = isSuperAdmin ? 0 : businessId;

    const result = await generateBusinessTokenAction({
      business_id,
      session_token: sessionToken,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'No se pudo generar business token');
    }

    TokenStorage.setBusinessToken(result.data.token);
    TokenStorage.setActiveBusiness(business_id);
    return result.data.token;
  };

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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Activos/Equipos" size="lg">
      <div className="space-y-4">
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <p className="text-sm text-gray-600">
          Registre los equipos, herramientas o activos que el visitante ingresa a la propiedad.
        </p>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {assets.map((asset, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Activo #{index + 1}</span>
                {assets.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveAsset(index)}
                    title="Eliminar activo"
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nombre del activo *"
                  value={asset.assetName}
                  onChange={(e) => handleAssetChange(index, 'assetName', e.target.value)}
                  placeholder="Ej: Laptop, Taladro, Caja de herramientas"
                />
                <Input
                  label="Marca"
                  value={asset.assetBrand}
                  onChange={(e) => handleAssetChange(index, 'assetBrand', e.target.value)}
                  placeholder="Ej: Dell, Bosch"
                />
                <Input
                  label="Serial / Identificador"
                  value={asset.assetSerial}
                  onChange={(e) => handleAssetChange(index, 'assetSerial', e.target.value)}
                  placeholder="Ej: ABC123456"
                />
                <Input
                  label="Descripcion"
                  value={asset.assetDescription}
                  onChange={(e) => handleAssetChange(index, 'assetDescription', e.target.value)}
                  placeholder="Descripcion adicional"
                />
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={handleAddAsset} className="w-full">
          <PlusIcon className="h-4 w-4 mr-2" />
          Agregar otro activo
        </Button>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Activos'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
