package usecasehorizontalproperty

import (
	"context"
	"fmt"
	"strings"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// CreateHorizontalProperty crea una nueva propiedad horizontal
func (uc *HorizontalPropertyUseCase) CreateHorizontalProperty(ctx context.Context, dto domain.CreateHorizontalPropertyDTO) (*domain.HorizontalPropertyDTO, error) {
	uc.logger.Info().Msg("Iniciando creación de propiedad horizontal")

	// ═══════════════════════════════════════════════════════════════════
	// VALIDACIONES PREVIAS
	// ═══════════════════════════════════════════════════════════════════

	// 1. Validar que el código no exista
	normalizedCode := strings.ToLower(strings.TrimSpace(dto.Code))
	exists, err := uc.repo.ExistsHorizontalPropertyByCode(ctx, normalizedCode, nil)
	if err != nil {
		uc.logger.Error().Err(err).Str("code", normalizedCode).Msg("Error verificando existencia del código")
		return nil, fmt.Errorf("error verificando código: %w", err)
	}
	if exists {
		uc.logger.Warn().Str("code", normalizedCode).Msg("El código de propiedad horizontal ya existe")
		return nil, domain.ErrHorizontalPropertyCodeExists
	}

	// 2. Validar que el custom_domain no exista (solo si se proporciona un valor)
	if dto.CustomDomain != "" {
		domainExists, err := uc.repo.ExistsCustomDomain(ctx, dto.CustomDomain, nil)
		if err != nil {
			uc.logger.Error().Err(err).Str("custom_domain", dto.CustomDomain).Msg("Error verificando existencia del dominio personalizado")
			return nil, fmt.Errorf("error verificando dominio personalizado: %w", err)
		}
		if domainExists {
			uc.logger.Warn().Str("custom_domain", dto.CustomDomain).Msg("El dominio personalizado ya existe")
			return nil, domain.ErrCustomDomainExists
		}
	}

	// 3. Validar que el parent_business existe (si se proporciona)
	if dto.ParentBusinessID != nil && *dto.ParentBusinessID != 0 {
		parentExists, err := uc.repo.ParentBusinessExists(ctx, *dto.ParentBusinessID)
		if err != nil {
			uc.logger.Error().Err(err).Uint("parent_business_id", *dto.ParentBusinessID).Msg("Error verificando existencia del negocio padre")
			return nil, fmt.Errorf("error verificando negocio padre: %w", err)
		}
		if !parentExists {
			uc.logger.Warn().Uint("parent_business_id", *dto.ParentBusinessID).Msg("El negocio padre especificado no existe")
			return nil, domain.ErrParentBusinessNotFound
		}
	}

	// 4. Obtener automáticamente el tipo de negocio de propiedad horizontal
	businessType, err := uc.repo.GetHorizontalPropertyType(ctx)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error obteniendo tipo de negocio horizontal_property")
		return nil, domain.ErrBusinessTypeNotFound
	}

	// ═══════════════════════════════════════════════════════════════════
	// SUBIR IMÁGENES A S3
	// ═══════════════════════════════════════════════════════════════════

	// Subir logo si viene archivo
	logoURL := ""
	if dto.LogoFile != nil {
		uc.logger.Info().Str("filename", dto.LogoFile.Filename).Msg("Subiendo logo de propiedad horizontal a S3")
		path, err := uc.s3.UploadImage(ctx, dto.LogoFile, "horizontal-property/logos")
		if err != nil {
			uc.logger.Error().Err(err).Msg("Error al subir logo a S3")
			return nil, fmt.Errorf("error al subir logo: %w", err)
		}
		logoURL = path // Guardar solo path relativo
	}

	// Subir imagen de navbar si viene archivo
	navbarImageURL := ""
	if dto.NavbarImageFile != nil {
		uc.logger.Info().Str("filename", dto.NavbarImageFile.Filename).Msg("Subiendo imagen de navbar a S3")
		path, err := uc.s3.UploadImage(ctx, dto.NavbarImageFile, "horizontal-property/navbar")
		if err != nil {
			uc.logger.Error().Err(err).Msg("Error al subir imagen de navbar a S3")
			return nil, fmt.Errorf("error al subir imagen de navbar: %w", err)
		}
		navbarImageURL = path
	}

	// Crear entidad de propiedad horizontal (sin ID, timestamps se generan automáticamente)
	property := &domain.HorizontalProperty{
		Name:             strings.TrimSpace(dto.Name),
		Code:             normalizedCode,
		BusinessTypeID:   businessType.ID,
		ParentBusinessID: dto.ParentBusinessID,
		Timezone:         dto.Timezone,
		Address:          strings.TrimSpace(dto.Address),
		Description:      strings.TrimSpace(dto.Description),

		// Configuración de marca blanca con valores por defecto
		LogoURL:         logoURL,
		PrimaryColor:    getOrDefault(dto.PrimaryColor, "#1f2937"),
		SecondaryColor:  getOrDefault(dto.SecondaryColor, "#3b82f6"),
		TertiaryColor:   getOrDefault(dto.TertiaryColor, "#10b981"),
		QuaternaryColor: getOrDefault(dto.QuaternaryColor, "#fbbf24"),
		NavbarImageURL:  navbarImageURL,
		CustomDomain:    dto.CustomDomain,

		// Configuración de funcionalidades (por defecto para propiedades horizontales)
		EnableDelivery:     false, // No típico en propiedades horizontales
		EnablePickup:       false, // No típico en propiedades horizontales
		EnableReservations: true,  // Sí para áreas comunes

		// Configuración específica de propiedades horizontales
		TotalUnits:    dto.TotalUnits,
		TotalFloors:   dto.TotalFloors,
		HasElevator:   dto.HasElevator,
		HasParking:    dto.HasParking,
		HasPool:       dto.HasPool,
		HasGym:        dto.HasGym,
		HasSocialArea: dto.HasSocialArea,

		IsActive: true,
		// ID, CreatedAt, UpdatedAt se generan automáticamente
	}

	// Crear en el repositorio
	createdProperty, err := uc.repo.CreateHorizontalProperty(ctx, property)
	if err != nil {
		uc.logger.Error().Err(err).Str("name", dto.Name).Msg("Error creando propiedad horizontal")
		return nil, fmt.Errorf("error creando propiedad horizontal: %w", err)
	}

	uc.logger.Info().Uint("id", createdProperty.ID).Str("name", createdProperty.Name).Msg("Propiedad horizontal creada exitosamente")

	// ═══════════════════════════════════════════════════════════════════
	// CONFIGURACIÓN INICIAL AUTOMÁTICA (SETUP)
	// ═══════════════════════════════════════════════════════════════════
	if dto.SetupOptions != nil {
		uc.logger.Info().Uint("property_id", createdProperty.ID).Msg("Iniciando configuración inicial automática")

		// 1. Crear unidades de propiedad
		if dto.SetupOptions.CreateUnits {
			if err := uc.createPropertyUnits(ctx, createdProperty.ID, dto); err != nil {
				uc.logger.Error().Err(err).Msg("Error creando unidades de propiedad")
				// No retornamos error, solo logueamos para no bloquear la creación
			}
		}

		// 2. Crear comités requeridos por ley
		if dto.SetupOptions.CreateRequiredCommittees {
			if err := uc.repo.CreateRequiredCommittees(ctx, createdProperty.ID); err != nil {
				uc.logger.Error().Err(err).Msg("Error creando comités requeridos")
				// No retornamos error, solo logueamos
			}
		}

		uc.logger.Info().Uint("property_id", createdProperty.ID).Msg("Configuración inicial completada")
	}

	// Convertir a DTO de respuesta
	return uc.mapToDTO(createdProperty, businessType), nil
}

// getOrDefault retorna el valor si no está vacío, sino el valor por defecto
func getOrDefault(value, defaultValue string) string {
	if strings.TrimSpace(value) == "" {
		return defaultValue
	}
	return value
}

// createPropertyUnits genera y crea las unidades de propiedad de forma básica
func (uc *HorizontalPropertyUseCase) createPropertyUnits(ctx context.Context, businessID uint, dto domain.CreateHorizontalPropertyDTO) error {
	options := dto.SetupOptions

	// Número inicial (por defecto 1)
	startNumber := 1
	if options.StartUnitNumber > 0 {
		startNumber = options.StartUnitNumber
	}

	// Tipo de unidad (por defecto apartment)
	unitType := "apartment"
	if options.UnitType != "" {
		unitType = options.UnitType
	}

	// Generar unidades básicas: solo número y tipo
	units := make([]domain.PropertyUnitCreate, dto.TotalUnits)
	for i := 0; i < dto.TotalUnits; i++ {
		unitNumber := startNumber + i
		units[i] = domain.PropertyUnitCreate{
			Number:   fmt.Sprintf("%d", unitNumber),
			UnitType: unitType,
		}
	}

	uc.logger.Info().
		Int("total_units", len(units)).
		Int("start_number", startNumber).
		Str("unit_type", unitType).
		Msg("Creando unidades básicas")

	// Crear unidades en el repositorio
	return uc.repo.CreatePropertyUnits(ctx, businessID, units)
}
