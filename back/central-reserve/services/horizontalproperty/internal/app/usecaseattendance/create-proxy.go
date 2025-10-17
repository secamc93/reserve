package usecaseattendance

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// CreateProxy - Crear apoderado
func (uc *AttendanceUseCase) CreateProxy(ctx context.Context, dto domain.CreateProxyDTO) (*domain.ProxyDTO, error) {
	uc.logger.Info().
		Uint("business_id", dto.BusinessID).
		Uint("property_unit_id", dto.PropertyUnitID).
		Str("proxy_name", dto.ProxyName).
		Str("proxy_type", dto.ProxyType).
		Msg("Creando apoderado")

	// Generar DNI aleatorio si no viene
	proxyDni := dto.ProxyDni
	if proxyDni == "" {
		proxyDni = fmt.Sprintf("PX%v", time.Now().UnixNano())
	}

	// Crear entidad
	proxy := domain.Proxy{
		BusinessID:      dto.BusinessID,
		PropertyUnitID:  dto.PropertyUnitID,
		ProxyName:       dto.ProxyName,
		ProxyDni:        proxyDni,
		ProxyEmail:      dto.ProxyEmail,
		ProxyPhone:      dto.ProxyPhone,
		ProxyAddress:    dto.ProxyAddress,
		ProxyType:       dto.ProxyType,
		IsActive:        true,
		StartDate:       dto.StartDate,
		EndDate:         dto.EndDate,
		PowerOfAttorney: dto.PowerOfAttorney,
		Notes:           dto.Notes,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Guardar en repositorio
	created, err := uc.attendanceRepo.CreateProxy(ctx, proxy)
	if err != nil {
		uc.logger.Error().Err(err).
			Uint("business_id", dto.BusinessID).
			Uint("property_unit_id", dto.PropertyUnitID).
			Str("proxy_name", dto.ProxyName).
			Msg("Error creando apoderado")
		return nil, err
	}

	// Mapear a DTO de respuesta
	response := &domain.ProxyDTO{
		ID:              created.ID,
		BusinessID:      created.BusinessID,
		PropertyUnitID:  created.PropertyUnitID,
		ProxyName:       created.ProxyName,
		ProxyDni:        created.ProxyDni,
		ProxyEmail:      created.ProxyEmail,
		ProxyPhone:      created.ProxyPhone,
		ProxyAddress:    created.ProxyAddress,
		ProxyType:       created.ProxyType,
		IsActive:        created.IsActive,
		StartDate:       created.StartDate,
		EndDate:         created.EndDate,
		PowerOfAttorney: created.PowerOfAttorney,
		Notes:           created.Notes,
		CreatedAt:       created.CreatedAt,
		UpdatedAt:       created.UpdatedAt,
	}

	uc.logger.Info().
		Uint("proxy_id", created.ID).
		Uint("property_unit_id", dto.PropertyUnitID).
		Str("proxy_name", dto.ProxyName).
		Msg("Apoderado creado exitosamente")

	return response, nil
}
