package usecasehorizontalproperty

import (
	"context"
	"fmt"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// UpdateHorizontalProperty actualiza una propiedad horizontal existente
func (uc *HorizontalPropertyUseCase) UpdateHorizontalProperty(ctx context.Context, id uint, dto domain.UpdateHorizontalPropertyDTO) (*domain.HorizontalPropertyDTO, error) {
	uc.logger.Info().Uint("id", id).Msg("Iniciando actualización de propiedad horizontal")

	// Obtener la propiedad horizontal existente
	existingProperty, err := uc.repo.GetHorizontalPropertyByID(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo propiedad horizontal para actualizar")
		return nil, domain.ErrHorizontalPropertyNotFound
	}

	// ═══════════════════════════════════════════════════════════════════
	// VALIDACIONES PREVIAS
	// ═══════════════════════════════════════════════════════════════════

	// 1. Validar código único si se está actualizando
	if dto.Code != nil {
		normalizedCode := strings.ToLower(strings.TrimSpace(*dto.Code))
		exists, err := uc.repo.ExistsHorizontalPropertyByCode(ctx, normalizedCode, &id)
		if err != nil {
			uc.logger.Error().Err(err).Str("code", normalizedCode).Msg("Error verificando existencia del código")
			return nil, fmt.Errorf("error verificando código: %w", err)
		}
		if exists {
			uc.logger.Warn().Str("code", normalizedCode).Msg("El código de propiedad horizontal ya existe")
			return nil, domain.ErrHorizontalPropertyCodeExists
		}
		existingProperty.Code = normalizedCode
	}

	// 2. Validar custom_domain único si se está actualizando
	if dto.CustomDomain != nil {
		domainExists, err := uc.repo.ExistsCustomDomain(ctx, *dto.CustomDomain, &id)
		if err != nil {
			uc.logger.Error().Err(err).Str("custom_domain", *dto.CustomDomain).Msg("Error verificando existencia del dominio personalizado")
			return nil, fmt.Errorf("error verificando dominio personalizado: %w", err)
		}
		if domainExists {
			uc.logger.Warn().Str("custom_domain", *dto.CustomDomain).Msg("El dominio personalizado ya existe")
			return nil, domain.ErrCustomDomainExists
		}
	}

	// 3. Validar parent_business existe si se está actualizando
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

	// Actualizar campos si se proporcionan
	if dto.Name != nil {
		existingProperty.Name = strings.TrimSpace(*dto.Name)
	}
	if dto.ParentBusinessID != nil {
		existingProperty.ParentBusinessID = dto.ParentBusinessID
	}
	if dto.Timezone != nil {
		existingProperty.Timezone = *dto.Timezone
	}
	if dto.Address != nil {
		existingProperty.Address = strings.TrimSpace(*dto.Address)
	}
	if dto.Description != nil {
		existingProperty.Description = strings.TrimSpace(*dto.Description)
	}

	// Actualizar configuración de marca blanca

	// Logo: subir nuevo archivo si viene, eliminar anterior
	if dto.LogoFile != nil {
		uc.logger.Info().Uint("id", id).Str("filename", dto.LogoFile.Filename).Msg("Subiendo nuevo logo a S3")
		path, err := uc.s3.UploadImage(ctx, dto.LogoFile, "horizontal-property/logos")
		if err != nil {
			uc.logger.Error().Err(err).Msg("Error al subir nuevo logo a S3")
			return nil, fmt.Errorf("error al subir logo: %w", err)
		}
		// Eliminar logo anterior si existe y es path relativo
		if existingProperty.LogoURL != "" && !strings.HasPrefix(existingProperty.LogoURL, "http") {
			if err := uc.s3.DeleteImage(ctx, existingProperty.LogoURL); err != nil {
				uc.logger.Warn().Err(err).Str("old_logo", existingProperty.LogoURL).Msg("No se pudo eliminar logo anterior (no crítico)")
			}
		}
		existingProperty.LogoURL = path
	}

	// Navbar: subir nuevo archivo si viene, eliminar anterior
	if dto.NavbarImageFile != nil {
		uc.logger.Info().Uint("id", id).Str("filename", dto.NavbarImageFile.Filename).Msg("Subiendo nueva imagen de navbar a S3")
		path, err := uc.s3.UploadImage(ctx, dto.NavbarImageFile, "horizontal-property/navbar")
		if err != nil {
			uc.logger.Error().Err(err).Msg("Error al subir imagen de navbar a S3")
			return nil, fmt.Errorf("error al subir imagen de navbar: %w", err)
		}
		// Eliminar navbar anterior si existe y es path relativo
		if existingProperty.NavbarImageURL != "" && !strings.HasPrefix(existingProperty.NavbarImageURL, "http") {
			if err := uc.s3.DeleteImage(ctx, existingProperty.NavbarImageURL); err != nil {
				uc.logger.Warn().Err(err).Str("old_navbar", existingProperty.NavbarImageURL).Msg("No se pudo eliminar navbar anterior (no crítico)")
			}
		}
		existingProperty.NavbarImageURL = path
	}

	if dto.PrimaryColor != nil {
		existingProperty.PrimaryColor = *dto.PrimaryColor
	}
	if dto.SecondaryColor != nil {
		existingProperty.SecondaryColor = *dto.SecondaryColor
	}
	if dto.TertiaryColor != nil {
		existingProperty.TertiaryColor = *dto.TertiaryColor
	}
	if dto.QuaternaryColor != nil {
		existingProperty.QuaternaryColor = *dto.QuaternaryColor
	}
	if dto.CustomDomain != nil {
		existingProperty.CustomDomain = *dto.CustomDomain
	}

	// Actualizar configuración específica de propiedades horizontales
	if dto.TotalUnits != nil {
		existingProperty.TotalUnits = *dto.TotalUnits
	}
	if dto.TotalFloors != nil {
		existingProperty.TotalFloors = dto.TotalFloors
	}
	if dto.HasElevator != nil {
		existingProperty.HasElevator = *dto.HasElevator
	}
	if dto.HasParking != nil {
		existingProperty.HasParking = *dto.HasParking
	}
	if dto.HasPool != nil {
		existingProperty.HasPool = *dto.HasPool
	}
	if dto.HasGym != nil {
		existingProperty.HasGym = *dto.HasGym
	}
	if dto.HasSocialArea != nil {
		existingProperty.HasSocialArea = *dto.HasSocialArea
	}
	if dto.IsActive != nil {
		existingProperty.IsActive = *dto.IsActive
	}

	// Actualizar timestamp
	existingProperty.UpdatedAt = time.Now()

	// Actualizar en el repositorio
	updatedProperty, err := uc.repo.UpdateHorizontalProperty(ctx, id, existingProperty)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error actualizando propiedad horizontal")
		return nil, fmt.Errorf("error actualizando propiedad horizontal: %w", err)
	}

	// Obtener información del tipo de negocio
	businessType, err := uc.repo.GetBusinessTypeByID(ctx, updatedProperty.BusinessTypeID)
	if err != nil {
		uc.logger.Error().Err(err).Uint("business_type_id", updatedProperty.BusinessTypeID).Msg("Error obteniendo tipo de negocio")
		return nil, fmt.Errorf("error obteniendo tipo de negocio: %w", err)
	}

	uc.logger.Info().Uint("id", id).Str("name", updatedProperty.Name).Msg("Propiedad horizontal actualizada exitosamente")

	return uc.mapToDTO(updatedProperty, businessType), nil
}
