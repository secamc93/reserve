"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Business,
  CreateBusinessRequest,
  UpdateBusinessRequest,
  BusinessType,
} from "../../domain/Business";
import ModalBase from "@/shared/ui/components/ModalBase/ModalBase";
import ErrorMessage from "@/shared/ui/components/ErrorMessage/ErrorMessage";
import "./BusinessModal.css";

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateBusinessRequest | UpdateBusinessRequest,
  ) => Promise<void>;
  business?: Business | null;
  mode: "create" | "edit";
  businessTypes: BusinessType[];
  loadingBusiness?: boolean;
}

const BusinessModal: React.FC<BusinessModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  business,
  mode,
  businessTypes,
  loadingBusiness,
}) => {
  const [formData, setFormData] = useState<
    CreateBusinessRequest | UpdateBusinessRequest
  >({
    name: "",
    code: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logo_url: "",
    timezone: "Europe/Madrid",
    primary_color: "#3b82f6",
    secondary_color: "#8b5cf6",
    tertiary_color: "#10b981",
    quaternary_color: "#fbbf24",
    custom_domain: "",
    business_type_id: 1,
    enable_delivery: false,
    enable_pickup: false,
    enable_reservations: true,
  });

  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedNavbarFile, setSelectedNavbarFile] = useState<File | null>(
    null,
  );
  const [navbarPreview, setNavbarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const colorPalettes = useMemo(
    () => [
      {
        primary: "#1f2937",
        secondary: "#3b82f6",
        tertiary: "#10b981",
        quaternary: "#fbbf24",
      },
      {
        primary: "#0f172a",
        secondary: "#be185d",
        tertiary: "#06b6d4",
        quaternary: "#f59e0b",
      },
    ],
    [],
  );

  useEffect(() => {
    if (business && mode === "edit") {
      setFormData({
        name: business.name,
        code: business.code,
        description: business.description,
        address: business.address,
        phone: business.phone,
        email: business.email,
        website: business.website,
        logo_url: business.logo_url,
        timezone: business.timezone,
        primary_color: business.primary_color,
        secondary_color: business.secondary_color,
        tertiary_color: business.tertiary_color,
        quaternary_color: business.quaternary_color,
        custom_domain: business.custom_domain,
        business_type_id: business.business_type_id,
        is_active: business.is_active,
        enable_delivery: business.enable_delivery,
        enable_pickup: business.enable_pickup,
        enable_reservations: business.enable_reservations,
      });

      // Si ya tiene logo, mostrar preview
      if (business.logo_url) {
        setLogoPreview(business.logo_url);
      }
      if (business.navbar_image_url) {
        setNavbarPreview(business.navbar_image_url);
      }
    } else {
      // Resetear al crear nuevo negocio
      setSelectedLogoFile(null);
      setLogoPreview(null);
      setSelectedNavbarFile(null);
      setNavbarPreview(null);
    }
  }, [business, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "El nombre del negocio es requerido";
    }

    if (!formData.code?.trim()) {
      newErrors.code = "El código del negocio es requerido";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "La dirección es requerida";
    }

    if (!formData.business_type_id) {
      newErrors.business_type_id = "El tipo de negocio es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        alert(
          "Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, etc.)",
        );
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen debe ser menor a 5MB");
        return;
      }

      setSelectedLogoFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogoFile = () => {
    setSelectedLogoFile(null);
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo_url: "" }));
  };

  const handleNavbarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert(
          "Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, etc.)",
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen debe ser menor a 5MB");
        return;
      }
      setSelectedNavbarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setNavbarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeNavbarFile = () => {
    setSelectedNavbarFile(null);
    setNavbarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError(null);
    try {
      // Siempre usar FormData para mantener consistencia con el backend
      const formDataToSend = new FormData();

      // Campos requeridos siempre se envían
      formDataToSend.append("name", formData.name || "");
      formDataToSend.append("code", formData.code || "");
      formDataToSend.append(
        "business_type_id",
        formData.business_type_id?.toString() || "",
      );

      // Solo enviar campos opcionales si tienen valor
      if (formData.description?.trim())
        formDataToSend.append("description", formData.description);
      if (formData.address?.trim())
        formDataToSend.append("address", formData.address);
      if (formData.phone?.trim())
        formDataToSend.append("phone", formData.phone);
      if (formData.email?.trim())
        formDataToSend.append("email", formData.email);
      if (formData.website?.trim())
        formDataToSend.append("website", formData.website);
      if (formData.timezone?.trim())
        formDataToSend.append("timezone", formData.timezone);
      if (formData.primary_color?.trim())
        formDataToSend.append("primary_color", formData.primary_color);
      if (formData.secondary_color?.trim())
        formDataToSend.append("secondary_color", formData.secondary_color);
      if (formData.tertiary_color?.trim())
        formDataToSend.append("tertiary_color", formData.tertiary_color);
      if (formData.quaternary_color?.trim())
        formDataToSend.append("quaternary_color", formData.quaternary_color);
      if (formData.custom_domain?.trim())
        formDataToSend.append("custom_domain", formData.custom_domain);

      // Campos booleanos siempre se envían con valor por defecto
      formDataToSend.append(
        "enable_delivery",
        formData.enable_delivery?.toString() || "false",
      );
      formDataToSend.append(
        "enable_pickup",
        formData.enable_pickup?.toString() || "false",
      );
      formDataToSend.append(
        "enable_reservations",
        formData.enable_reservations?.toString() || "false",
      );

      // Solo agregar logo_file si hay un archivo seleccionado
      if (selectedLogoFile) {
        formDataToSend.append("logo_file", selectedLogoFile);
      }
      if (selectedNavbarFile) {
        formDataToSend.append("navbar_image_file", selectedNavbarFile);
      }

      await onSubmit(formDataToSend as any);
      onClose();
    } catch (error: any) {
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        "Ocurrió un error al guardar el negocio";
      setApiError(msg);
      console.error("Error al guardar el negocio:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Si está en modo edición y se está cargando el negocio, mostrar loading
  if (mode === "edit" && loadingBusiness) {
    return (
      <ModalBase
        isOpen={isOpen}
        onClose={onClose}
        title="✏️ Editar Negocio"
        actions={
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
        }
      >
        <div className="loading-state text-center py-12">
          <div className="loading-spinner mb-4">⏳</div>
          <p className="text-gray-600">Cargando datos del negocio...</p>
        </div>
      </ModalBase>
    );
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "🏢 Crear Nuevo Negocio" : "✏️ Editar Negocio"}
      actions={
        <>
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="business-form"
            className="btn-submit"
            disabled={loading}
          >
            {loading
              ? mode === "create"
                ? "Creando..."
                : "Actualizando..."
              : mode === "create"
                ? "Crear Negocio"
                : "Actualizar Negocio"}
          </button>
        </>
      }
    >
      {apiError && (
        <ErrorMessage
          message={apiError}
          title="Error al procesar la solicitud"
          variant="error"
          dismissible={true}
          onDismiss={() => setApiError(null)}
          className="mb-4"
        />
      )}

      <form
        id="business-form"
        onSubmit={handleSubmit}
        className="modal-form"
        noValidate
      >
        <div className="form-grid">
          {/* Información básica */}
          <div className="form-group">
            <label htmlFor="name">Nombre del Negocio *</label>
            <input
              type="text"
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "error" : ""}
              required
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="code">Código del Negocio *</label>
            <input
              type="text"
              id="code"
              value={formData.code || ""}
              onChange={(e) => handleInputChange("code", e.target.value)}
              className={errors.code ? "error" : ""}
              placeholder="Código único del negocio"
              required
            />
            {errors.code && <p className="error-text">{errors.code}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="business_type_id">Tipo de Negocio *</label>
            <select
              id="business_type_id"
              value={formData.business_type_id || ""}
              onChange={(e) =>
                handleInputChange("business_type_id", parseInt(e.target.value))
              }
              className={errors.business_type_id ? "error" : ""}
              required
            >
              <option value="">Seleccionar tipo</option>
              {businessTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
            {errors.business_type_id && (
              <p className="error-text">{errors.business_type_id}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="timezone">Zona Horaria</label>
            <select
              id="timezone"
              value={formData.timezone || ""}
              onChange={(e) => handleInputChange("timezone", e.target.value)}
            >
              <option value="Europe/Madrid">Europe/Madrid</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="America/Bogota">America/Bogota</option>
            </select>
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="address">Dirección *</label>
            <input
              type="text"
              id="address"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={errors.address ? "error" : ""}
              required
            />
            {errors.address && <p className="error-text">{errors.address}</p>}
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Información de contacto */}
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+57 300 123 4567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="contacto@negocio.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">Sitio Web</label>
            <input
              type="url"
              id="website"
              value={formData.website || ""}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://www.negocio.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="logo_file">Logo del Negocio</label>
            <div className="logo-upload-container">
              {logoPreview ? (
                <div className="logo-preview">
                  <img src={logoPreview} alt="Preview del logo" />
                  <button
                    type="button"
                    className="remove-logo-btn"
                    onClick={removeLogoFile}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="logo-upload-area">
                  <input
                    type="file"
                    id="logo_file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="logo-file-input"
                  />
                  <label htmlFor="logo_file" className="logo-upload-label">
                    <div className="upload-icon">📷</div>
                    <span>Haz clic para seleccionar una imagen</span>
                    <small>JPG, PNG, GIF - Máximo 5MB</small>
                  </label>
                </div>
              )}
            </div>
            {selectedLogoFile && (
              <p className="file-info">
                Archivo seleccionado: {selectedLogoFile.name}(
                {(selectedLogoFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Configuración de marca */}
          <div className="palette-options">
            {colorPalettes.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="palette-option"
                style={{
                  background: p.primary,
                  marginRight: "4px",
                  width: "24px",
                  height: "24px",
                  border: "none",
                  cursor: "pointer",
                }}
                title={`Palette ${idx + 1}`}
                onClick={() => {
                  handleInputChange("primary_color", p.primary);
                  handleInputChange("secondary_color", p.secondary);
                  handleInputChange("tertiary_color", p.tertiary);
                  handleInputChange("quaternary_color", p.quaternary);
                }}
              />
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="primary_color">Color Primario</label>
            <input
              type="color"
              id="primary_color"
              value={formData.primary_color || "#3b82f6"}
              onChange={(e) =>
                handleInputChange("primary_color", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="secondary_color">Color Secundario</label>
            <input
              type="color"
              id="secondary_color"
              value={formData.secondary_color || "#8b5cf6"}
              onChange={(e) =>
                handleInputChange("secondary_color", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="tertiary_color">Color Terciario</label>
            <input
              type="color"
              id="tertiary_color"
              value={formData.tertiary_color || "#10b981"}
              onChange={(e) =>
                handleInputChange("tertiary_color", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="quaternary_color">Color Cuaternario</label>
            <input
              type="color"
              id="quaternary_color"
              value={formData.quaternary_color || "#fbbf24"}
              onChange={(e) =>
                handleInputChange("quaternary_color", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="navbar_image_file">Imagen de Navegación</label>
            <div className="navbar-upload-container">
              {navbarPreview ? (
                <div className="navbar-preview">
                  <img src={navbarPreview} alt="Preview navbar" />
                  <button
                    type="button"
                    className="remove-navbar-btn"
                    onClick={removeNavbarFile}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="navbar-upload-area">
                  <input
                    type="file"
                    id="navbar_image_file"
                    accept="image/*"
                    onChange={handleNavbarFileChange}
                    className="navbar-file-input"
                  />
                  <label
                    htmlFor="navbar_image_file"
                    className="navbar-upload-label"
                  >
                    <div className="upload-icon">📷</div>
                    <span>Haz clic para seleccionar una imagen</span>
                    <small>JPG, PNG, GIF - Máximo 5MB</small>
                  </label>
                </div>
              )}
            </div>
            {selectedNavbarFile && (
              <p className="file-info">
                Archivo seleccionado: {selectedNavbarFile.name} (
                {(selectedNavbarFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="custom_domain">Dominio Personalizado</label>
            <input
              type="text"
              id="custom_domain"
              value={formData.custom_domain || ""}
              onChange={(e) =>
                handleInputChange("custom_domain", e.target.value)
              }
              placeholder="mi-negocio.com"
            />
          </div>

          {/* Funcionalidades */}
          <div className="form-group form-group-full">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.enable_reservations || false}
                onChange={(e) =>
                  handleInputChange("enable_reservations", e.target.checked)
                }
              />
              Habilitar Reservas
            </label>
          </div>

          <div className="form-group form-group-full">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.enable_delivery || false}
                onChange={(e) =>
                  handleInputChange("enable_delivery", e.target.checked)
                }
              />
              Habilitar Delivery
            </label>
          </div>

          <div className="form-group form-group-full">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.enable_pickup || false}
                onChange={(e) =>
                  handleInputChange("enable_pickup", e.target.checked)
                }
              />
              Habilitar Recogida
            </label>
          </div>
        </div>
      </form>
    </ModalBase>
  );
};

export default BusinessModal;
