package usecaseresident

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
)

func (uc *residentUseCase) CreateResident(ctx context.Context, dto domain.CreateResidentDTO) (*domain.ResidentDetailDTO, error) {
	// Validaciones
	if dto.Name == "" {
		return nil, domain.ErrResidentNameRequired
	}
	if dto.Email == "" {
		return nil, domain.ErrResidentEmailRequired
	}
	if dto.Dni == "" {
		return nil, domain.ErrResidentDniRequired
	}

	// Verificar email único por propiedad
	emailExists, err := uc.repo.ExistsResidentByEmail(ctx, dto.BusinessID, dto.Email, 0)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error verificando email existente")
		return nil, err
	}
	if emailExists {
		return nil, domain.ErrResidentEmailExists
	}

	// Verificar DNI único por propiedad
	dniExists, err := uc.repo.ExistsResidentByDni(ctx, dto.BusinessID, dto.Dni, 0)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error verificando DNI existente")
		return nil, err
	}
	if dniExists {
		return nil, domain.ErrResidentDniExists
	}

	// Crear entidad
	entity := &domain.Resident{
		BusinessID:       dto.BusinessID,
		PropertyUnitID:   dto.PropertyUnitID,
		ResidentTypeID:   dto.ResidentTypeID,
		Name:             dto.Name,
		Email:            dto.Email,
		Phone:            dto.Phone,
		Dni:              dto.Dni,
		EmergencyContact: dto.EmergencyContact,
		IsMainResident:   dto.IsMainResident,
		MoveInDate:       dto.MoveInDate,
		LeaseStartDate:   dto.LeaseStartDate,
		LeaseEndDate:     dto.LeaseEndDate,
		MonthlyRent:      dto.MonthlyRent,
		IsActive:         true,
	}

	// Guardar en repositorio
	created, err := uc.repo.CreateResident(ctx, entity)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error creando residente")
		return nil, err
	}

	// Obtener detalle completo (con joins)
	detail, err := uc.repo.GetResidentByID(ctx, created.ID)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error obteniendo detalle de residente creado")
		return nil, err
	}

	return detail, nil
}
