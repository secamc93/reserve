/**
 * Modal: Crear Propiedad Horizontal
 */

'use client';

import { useState } from 'react';
import { Modal, Input, Spinner } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createHorizontalPropertyAction } from '../infrastructure/actions/create-horizontal-property.action';

interface CreatePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePropertyModal({ isOpen, onClose, onSuccess }: CreatePropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos básicos requeridos
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  
  // Campos opcionales
  const [description, setDescription] = useState('');
  const [timezone, setTimezone] = useState('America/Bogota');
  const [totalUnits, setTotalUnits] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  
  // Colores
  const [primaryColor, setPrimaryColor] = useState('#1f2937');
  const [secondaryColor, setSecondaryColor] = useState('#3b82f6');
  const [tertiaryColor, setTertiaryColor] = useState('#10b981');
  const [quaternaryColor, setQuaternaryColor] = useState('#fbbf24');
  
  // Archivos de imagen
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [navbarImageFile, setNavbarImageFile] = useState<File | null>(null);
  const [customDomain, setCustomDomain] = useState('');
  
  // Amenidades
  const [hasElevator, setHasElevator] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [hasPool, setHasPool] = useState(false);
  const [hasGym, setHasGym] = useState(false);
  const [hasSocialArea, setHasSocialArea] = useState(false);
  
  // Creación automática de unidades
  const [createUnits, setCreateUnits] = useState(false);
  const [unitPrefix, setUnitPrefix] = useState('Apto');
  const [unitType, setUnitType] = useState<'apartment' | 'house' | 'office'>('apartment');
  const [unitsPerFloor, setUnitsPerFloor] = useState('');
  const [startUnitNumber, setStartUnitNumber] = useState('1');
  
  // Comités
  const [createRequiredCommittees, setCreateRequiredCommittees] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!name.trim() || !code.trim() || !address.trim() || !timezone.trim() || !totalUnits) {
      setError('Los campos Nombre, Código, Dirección, Zona Horaria y Total de Unidades son obligatorios');
      return;
    }

    setLoading(true);

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const result = await createHorizontalPropertyAction({
        token,
        data: {
          // Requeridos
          name: name.trim(),
          code: code.trim(),
          address: address.trim(),
          timezone: timezone.trim(),
          totalUnits: parseInt(totalUnits),
          
          // Opcionales
          description: description.trim() || undefined,
          totalFloors: totalFloors ? parseInt(totalFloors) : undefined,
          
          // Amenidades
          hasElevator,
          hasParking,
          hasPool,
          hasGym,
          hasSocialArea,
          
          // Archivos
          logoFile: logoFile || undefined,
          navbarImageFile: navbarImageFile || undefined,
          
          // Personalización
          primaryColor,
          secondaryColor,
          tertiaryColor,
          quaternaryColor,
          customDomain: customDomain.trim() || undefined,
          
          // Creación automática de unidades
          createUnits,
          unitPrefix: createUnits && unitPrefix.trim() ? unitPrefix.trim() : undefined,
          unitType: createUnits ? unitType : undefined,
          unitsPerFloor: createUnits && unitsPerFloor ? parseInt(unitsPerFloor) : undefined,
          startUnitNumber: createUnits && startUnitNumber ? parseInt(startUnitNumber) : undefined,
          
          // Comités
          createRequiredCommittees,
        },
      });

      if (result.success) {
        console.log('✅ Propiedad creada:', result.data);
        resetForm();
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al crear la propiedad');
      }
    } catch (err) {
      console.error('Error creando propiedad:', err);
      setError('Error inesperado al crear la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setAddress('');
    setDescription('');
    setTimezone('America/Bogota');
    setTotalUnits('');
    setTotalFloors('');
    setPrimaryColor('#1f2937');
    setSecondaryColor('#3b82f6');
    setTertiaryColor('#10b981');
    setQuaternaryColor('#fbbf24');
    setLogoFile(null);
    setNavbarImageFile(null);
    setCustomDomain('');
    setHasElevator(false);
    setHasParking(false);
    setHasPool(false);
    setHasGym(false);
    setHasSocialArea(false);
    setCreateUnits(false);
    setUnitPrefix('Apto');
    setUnitType('apartment');
    setUnitsPerFloor('');
    setStartUnitNumber('1');
    setCreateRequiredCommittees(false);
    setError(null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El logo debe ser menor a 10MB');
        return;
      }
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('El logo debe ser una imagen (PNG, JPG)');
        return;
      }
      setLogoFile(file);
      setError(null);
    }
  };

  const handleNavbarImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('La imagen del navbar debe ser menor a 10MB');
        return;
      }
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('La imagen del navbar debe ser una imagen (PNG, JPG)');
        return;
      }
      setNavbarImageFile(file);
      setError(null);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nueva Propiedad Horizontal" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Información Básica
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Conjunto Residencial Los Pinos"
              disabled={loading}
            />
            
            <Input
              label="Código *"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej: los-pinos"
              disabled={loading}
            />
          </div>

          <Input
            label="Dirección *"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej: Carrera 15 #45-67, Bogotá"
            disabled={loading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la propiedad..."
              rows={3}
              className="input w-full"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Total de Unidades *"
              type="number"
              value={totalUnits}
              onChange={(e) => setTotalUnits(e.target.value)}
              placeholder="120"
              disabled={loading}
              required
            />
            
            <Input
              label="Total de Pisos"
              type="number"
              value={totalFloors}
              onChange={(e) => setTotalFloors(e.target.value)}
              placeholder="15"
              disabled={loading}
            />

            <Input
              label="Zona Horaria *"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/Bogota"
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Amenidades */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Amenidades
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasElevator}
                onChange={(e) => setHasElevator(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Ascensor</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasParking}
                onChange={(e) => setHasParking(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Parqueadero</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPool}
                onChange={(e) => setHasPool(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Piscina</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasGym}
                onChange={(e) => setHasGym(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Gimnasio</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSocialArea}
                onChange={(e) => setHasSocialArea(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Área Social</span>
            </label>
          </div>
        </div>

        {/* Personalización */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Personalización
          </h3>
          
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Primario
              </label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                disabled={loading}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Secundario
              </label>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                disabled={loading}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Terciario
              </label>
              <input
                type="color"
                value={tertiaryColor}
                onChange={(e) => setTertiaryColor(e.target.value)}
                disabled={loading}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Cuaternario
              </label>
              <input
                type="color"
                value={quaternaryColor}
                onChange={(e) => setQuaternaryColor(e.target.value)}
                disabled={loading}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo (PNG, JPG, max 10MB)
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleLogoChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {logoFile && (
                <p className="text-sm text-gray-600 mt-1">
                  ✓ {logoFile.name} ({(logoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen Navbar (PNG, JPG, max 10MB)
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleNavbarImageChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {navbarImageFile && (
                <p className="text-sm text-gray-600 mt-1">
                  ✓ {navbarImageFile.name} ({(navbarImageFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          <Input
            label="Dominio Personalizado"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="mipropiedad.example.com"
            disabled={loading}
          />
        </div>

        {/* Creación Automática de Unidades */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Creación Automática de Unidades
          </h3>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={createUnits}
              onChange={(e) => setCreateUnits(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">
              Crear unidades automáticamente
            </span>
          </label>

          {createUnits && (
            <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
              <Input
                label="Prefijo de Unidades"
                value={unitPrefix}
                onChange={(e) => setUnitPrefix(e.target.value)}
                placeholder="Apto"
                disabled={loading}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Unidad
                </label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as 'apartment' | 'house' | 'office')}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="office">Oficina</option>
                </select>
              </div>

              <Input
                label="Unidades por Piso"
                type="number"
                value={unitsPerFloor}
                onChange={(e) => setUnitsPerFloor(e.target.value)}
                placeholder="4"
                disabled={loading}
              />

              <Input
                label="Número Inicial"
                type="number"
                value={startUnitNumber}
                onChange={(e) => setStartUnitNumber(e.target.value)}
                placeholder="1"
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* Comités */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Comités
          </h3>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={createRequiredCommittees}
              onChange={(e) => setCreateRequiredCommittees(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">
              Crear comités requeridos automáticamente
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="btn btn-outline"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary min-w-[120px]"
          >
            {loading ? <Spinner size="sm" /> : 'Crear Propiedad'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

