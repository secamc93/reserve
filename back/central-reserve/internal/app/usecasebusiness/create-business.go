package usecasebusiness

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
	"strings"
)

// CreateBusiness crea un nuevo negocio
func (uc *BusinessUseCase) CreateBusiness(ctx context.Context, request dtos.BusinessRequest) (*dtos.BusinessResponse, error) {
	uc.log.Info().Str("name", request.Name).Str("code", request.Code).Msg("Creando negocio")

	// Validar que el código no exista
	existing, err := uc.repository.GetBusinessByCode(ctx, request.Code)
	if err != nil && err.Error() != "negocio no encontrado" {
		uc.log.Error().Err(err).Str("code", request.Code).Msg("Error al verificar código existente")
		return nil, fmt.Errorf("error al verificar código existente: %w", err)
	}

	if existing != nil {
		uc.log.Warn().Str("code", request.Code).Msg("Código de negocio ya existe")
		return nil, fmt.Errorf("el código '%s' ya existe", request.Code)
	}

	// Validar que el dominio personalizado no exista si se proporciona
	if request.CustomDomain != "" {
		domainExists, err := uc.repository.GetBusinessByCustomDomain(ctx, request.CustomDomain)
		if err != nil && err.Error() != "negocio no encontrado" {
			uc.log.Error().Err(err).Str("domain", request.CustomDomain).Msg("Error al verificar dominio existente")
			return nil, fmt.Errorf("error al verificar dominio existente: %w", err)
		}

		if domainExists != nil {
			uc.log.Warn().Str("domain", request.CustomDomain).Msg("Dominio personalizado ya existe")
			return nil, fmt.Errorf("el dominio '%s' ya existe", request.CustomDomain)
		}
	}

	// Subir logo si viene archivo
	logoURL := ""
	if request.LogoFile != nil {
		uc.log.Info().Str("filename", request.LogoFile.Filename).Msg("Subiendo logo de negocio a S3")
		path, err := uc.s3.UploadImage(ctx, request.LogoFile, "businessLogo")
		if err != nil {
			uc.log.Error().Err(err).Msg("Error al subir logo de negocio a S3")
			return nil, fmt.Errorf("error al subir logo: %w", err)
		}
		logoURL = path // Guardar solo path relativo
	}

	// Crear entidad
	business := entities.Business{
		Name:               request.Name,
		Code:               request.Code,
		BusinessTypeID:     request.BusinessTypeID,
		Timezone:           request.Timezone,
		Address:            request.Address,
		Description:        request.Description,
		LogoURL:            logoURL,
		PrimaryColor:       request.PrimaryColor,
		SecondaryColor:     request.SecondaryColor,
		CustomDomain:       request.CustomDomain,
		IsActive:           request.IsActive,
		EnableDelivery:     request.EnableDelivery,
		EnablePickup:       request.EnablePickup,
		EnableReservations: request.EnableReservations,
	}

	// Guardar en repositorio
	_, err = uc.repository.CreateBusiness(ctx, business)
	if err != nil {
		uc.log.Error().Err(err).Str("name", request.Name).Msg("Error al crear negocio")
		return nil, fmt.Errorf("error al crear negocio: %w", err)
	}

	// Obtener el negocio creado
	created, err := uc.repository.GetBusinessByCode(ctx, request.Code)
	if err != nil {
		uc.log.Error().Err(err).Str("code", request.Code).Msg("Error al obtener negocio creado")
		return nil, fmt.Errorf("error al obtener negocio creado: %w", err)
	}

	// Completar URL de logo si es path relativo
	fullLogoURL := created.LogoURL
	if fullLogoURL != "" && !strings.HasPrefix(fullLogoURL, "http") {
		base := strings.TrimRight(uc.env.Get("URL_BASE_DOMAIN_S3"), "/")
		if base != "" {
			fullLogoURL = fmt.Sprintf("%s/%s", base, strings.TrimLeft(fullLogoURL, "/"))
		}
	}

	response := &dtos.BusinessResponse{
		ID:   created.ID,
		Name: created.Name,
		Code: created.Code,
		BusinessType: dtos.BusinessTypeResponse{
			ID: created.BusinessTypeID, // Nota: necesitaríamos obtener el BusinessType completo
		},
		Timezone:           created.Timezone,
		Address:            created.Address,
		Description:        created.Description,
		LogoURL:            fullLogoURL,
		PrimaryColor:       created.PrimaryColor,
		SecondaryColor:     created.SecondaryColor,
		CustomDomain:       created.CustomDomain,
		IsActive:           created.IsActive,
		EnableDelivery:     created.EnableDelivery,
		EnablePickup:       created.EnablePickup,
		EnableReservations: created.EnableReservations,
		CreatedAt:          created.CreatedAt,
		UpdatedAt:          created.UpdatedAt,
	}

	uc.log.Info().Uint("id", created.ID).Str("name", request.Name).Msg("Negocio creado exitosamente")
	return response, nil
}
