package usecaseresident

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

func (uc *residentUseCase) CreateResident(ctx context.Context, dto domain.CreateResidentDTO) (*domain.ResidentDetailDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "CreateResident")

	// Validaciones
	if dto.Name == "" {
		uc.logger.Error(ctx).Str("name", dto.Name).Msg("Nombre de residente requerido")
		return nil, domain.ErrResidentNameRequired
	}
	if dto.Email == "" {
		uc.logger.Error(ctx).Str("email", dto.Email).Msg("Email de residente requerido")
		return nil, domain.ErrResidentEmailRequired
	}
	if dto.Dni == "" {
		uc.logger.Error(ctx).Str("dni", dto.Dni).Msg("DNI de residente requerido")
		return nil, domain.ErrResidentDniRequired
	}

	// Verificar email único por propiedad
	emailExists, err := uc.repo.ExistsResidentByEmail(ctx, dto.BusinessID, dto.Email, 0)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", dto.BusinessID).Str("email", dto.Email).Msg("Error verificando email existente")
		return nil, err
	}
	if emailExists {
		uc.logger.Warn(ctx).Uint("business_id", dto.BusinessID).Str("email", dto.Email).Msg("Email de residente ya existe")
		return nil, domain.ErrResidentEmailExists
	}

	// Verificar DNI único por propiedad
	dniExists, err := uc.repo.ExistsResidentByDni(ctx, dto.BusinessID, dto.Dni, 0)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", dto.BusinessID).Str("dni", dto.Dni).Msg("Error verificando DNI existente")
		return nil, err
	}
	if dniExists {
		uc.logger.Warn(ctx).Uint("business_id", dto.BusinessID).Str("dni", dto.Dni).Msg("DNI de residente ya existe")
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
		uc.logger.Error(ctx).Err(err).Uint("business_id", dto.BusinessID).Str("name", dto.Name).Str("email", dto.Email).Msg("Error creando residente en repositorio")
		return nil, err
	}

	// Obtener detalle completo (con joins)
	detail, err := uc.repo.GetResidentByID(ctx, created.ID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("resident_id", created.ID).Msg("Error obteniendo detalle de residente creado")
		return nil, err
	}

	return detail, nil
}
