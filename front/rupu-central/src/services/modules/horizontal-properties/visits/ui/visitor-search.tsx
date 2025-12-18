'use client';

import { useState } from 'react';
import { Input, Button, Alert, Spinner } from '@shared/ui';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { searchVisitorAction } from '../infrastructure/actions';
import { Visitor } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

interface VisitorSearchProps {
  businessId: number;
  onVisitorFound?: (visitor: Visitor) => void;
  onVisitorNotFound?: () => void;
}

export function VisitorSearch({ businessId, onVisitorFound, onVisitorNotFound }: VisitorSearchProps) {
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
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

  const handleSearch = async () => {
    if (!dni.trim()) {
      setError('Por favor ingrese un DNI');
      return;
    }

    setLoading(true);
    setError(null);
    setVisitor(null);

    try {
      const token = await getBusinessToken();
      const foundVisitor = await searchVisitorAction({
        businessId,
        dni: dni.trim(),
        token,
      });

      setVisitor(foundVisitor);
      onVisitorFound?.(foundVisitor);
    } catch (err: any) {
      setError(err.message || 'Visitante no encontrado');
      setVisitor(null);
      onVisitorNotFound?.();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            label="Número de Documento (DNI)"
            placeholder="Ejemplo: 1234567890"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            onKeyPress={handleKeyPress}
            helperText="Ingrese el número de documento del visitante"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSearch} disabled={loading || !dni.trim()}>
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {visitor && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-2">Visitante Encontrado</h3>
          <div className="space-y-1 text-sm">
            <div><strong>Nombre:</strong> {visitor.fullName}</div>
            <div><strong>DNI:</strong> {visitor.dni}</div>
            <div><strong>Teléfono:</strong> {visitor.phone}</div>
            {visitor.email && <div><strong>Email:</strong> {visitor.email}</div>}
            <div><strong>Total de visitas:</strong> {visitor.totalVisits}</div>
            {visitor.hasBlacklist && (
              <div className="text-red-600 font-semibold">⚠️ En lista negra</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
