package usecaseresident

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
)

func (uc *residentUseCase) UpdateResident(ctx context.Context, id uint, dto domain.UpdateResidentDTO) (*domain.ResidentDetailDTO, error) {
	// Verificar que el residente existe
	existing, err := uc.repo.GetResidentByID(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo residente")
		return nil, err
	}
	if existing == nil {
		return nil, domain.ErrResidentNotFound
	}

	// Si se está cambiando el email, verificar que no exista
	if dto.Email != nil && *dto.Email != existing.Email {
		emailExists, err := uc.repo.ExistsResidentByEmail(ctx, existing.BusinessID, *dto.Email, id)
		if err != nil {
			uc.logger.Error().Err(err).Msg("Error verificando email existente")
			return nil, err
		}
		if emailExists {
			return nil, domain.ErrResidentEmailExists
		}
	}

	// Si se está cambiando el DNI, verificar que no exista
	if dto.Dni != nil && *dto.Dni != existing.Dni {
		dniExists, err := uc.repo.ExistsResidentByDni(ctx, existing.BusinessID, *dto.Dni, id)
		if err != nil {
			uc.logger.Error().Err(err).Msg("Error verificando DNI existente")
			return nil, err
		}
		if dniExists {
			return nil, domain.ErrResidentDniExists
		}
	}

	// Crear entidad con cambios (necesitamos la entidad completa para el update)
	entity := &domain.Resident{
		ID:               id,
		BusinessID:       existing.BusinessID,
		PropertyUnitID:   existing.PropertyUnitID,
		ResidentTypeID:   existing.ResidentTypeID,
		Name:             existing.Name,
		Email:            existing.Email,
		Phone:            existing.Phone,
		Dni:              existing.Dni,
		EmergencyContact: existing.EmergencyContact,
		IsMainResident:   existing.IsMainResident,
		IsActive:         existing.IsActive,
		MoveInDate:       existing.MoveInDate,
		MoveOutDate:      existing.MoveOutDate,
		LeaseStartDate:   existing.LeaseStartDate,
		LeaseEndDate:     existing.LeaseEndDate,
		MonthlyRent:      existing.MonthlyRent,
	}

	// Aplicar cambios
	if dto.PropertyUnitID != nil {
		entity.PropertyUnitID = *dto.PropertyUnitID
	}
	if dto.ResidentTypeID != nil {
		entity.ResidentTypeID = *dto.ResidentTypeID
	}
	if dto.Name != nil {
		entity.Name = *dto.Name
	}
	if dto.Email != nil {
		entity.Email = *dto.Email
	}
	if dto.Phone != nil {
		entity.Phone = *dto.Phone
	}
	if dto.Dni != nil {
		entity.Dni = *dto.Dni
	}
	if dto.EmergencyContact != nil {
		entity.EmergencyContact = *dto.EmergencyContact
	}
	if dto.IsMainResident != nil {
		entity.IsMainResident = *dto.IsMainResident
	}
	if dto.IsActive != nil {
		entity.IsActive = *dto.IsActive
	}
	if dto.MoveInDate != nil {
		entity.MoveInDate = dto.MoveInDate
	}
	if dto.MoveOutDate != nil {
		entity.MoveOutDate = dto.MoveOutDate
	}
	if dto.LeaseStartDate != nil {
		entity.LeaseStartDate = dto.LeaseStartDate
	}
	if dto.LeaseEndDate != nil {
		entity.LeaseEndDate = dto.LeaseEndDate
	}
	if dto.MonthlyRent != nil {
		entity.MonthlyRent = dto.MonthlyRent
	}

	// Actualizar en repositorio
	_, err = uc.repo.UpdateResident(ctx, id, entity)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error actualizando residente")
		return nil, err
	}

	// Obtener detalle completo actualizado
	updated, err := uc.repo.GetResidentByID(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error obteniendo detalle de residente actualizado")
		return nil, err
	}

	return updated, nil
}
