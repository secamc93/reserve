package usecaseresident

import (
	"context"
	"fmt"
	"strings"

	"central_reserve/services/horizontalproperty/internal/domain"
)

func (uc *residentUseCase) BulkUpdateResidents(ctx context.Context, businessID uint, request domain.BulkUpdateResidentsRequest) (*domain.BulkUpdateResidentsResult, error) {
	result := &domain.BulkUpdateResidentsResult{
		TotalProcessed: len(request.Residents),
		Updated:        0,
		Errors:         0,
		ErrorDetails:   []domain.BulkUpdateErrorDetail{},
	}

	// Obtener map de números de unidad a IDs
	unitNumbers := make([]string, len(request.Residents))
	for i, resident := range request.Residents {
		unitNumbers[i] = resident.PropertyUnitNumber
	}

	unitMap, err := uc.repo.GetPropertyUnitsByNumbers(ctx, businessID, unitNumbers)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error obteniendo unidades de propiedad")
		return nil, fmt.Errorf("error obteniendo unidades de propiedad: %w", err)
	}

	// Procesar cada residente
	for _, residentItem := range request.Residents {
		// Verificar que la unidad existe
		unitID, exists := unitMap[residentItem.PropertyUnitNumber]
		if !exists {
			result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: 0, PropertyUnitNumber: residentItem.PropertyUnitNumber, Error: "Unidad no encontrada"})
			result.Errors++
			continue
		}

		// Buscar residente por unidad
		residents, err := uc.repo.ListResidents(ctx, domain.ResidentFiltersDTO{
			BusinessID:     businessID,
			PropertyUnitID: &unitID,
			Page:           1,
			PageSize:       10, // Solo necesitamos el primer residente de la unidad
		})
		if err != nil {
			result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: 0, PropertyUnitNumber: residentItem.PropertyUnitNumber, Error: fmt.Sprintf("Error buscando residente: %v", err)})
			result.Errors++
			continue
		}

		if len(residents.Residents) == 0 {
			result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: 0, PropertyUnitNumber: residentItem.PropertyUnitNumber, Error: "No se encontró residente en la unidad"})
			result.Errors++
			continue
		}

		// Tomar el primer residente (principal)
		resident := residents.Residents[0]

		// Obtener el residente completo para actualizar
		existingResident, err := uc.repo.GetResidentByID(ctx, resident.ID)
		if err != nil {
			result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: 0, PropertyUnitNumber: residentItem.PropertyUnitNumber, Error: fmt.Sprintf("Error obteniendo residente: %v", err)})
			result.Errors++
			continue
		}

		// Crear DTO de actualización
		updateDTO := domain.UpdateResidentDTO{}

		// Solo actualizar campos que se proporcionaron
		if residentItem.Name != nil && strings.TrimSpace(*residentItem.Name) != "" {
			updateDTO.Name = residentItem.Name
		}

		if residentItem.Dni != nil && strings.TrimSpace(*residentItem.Dni) != "" {
			updateDTO.Dni = residentItem.Dni
		}

		// Si no hay campos para actualizar, saltar
		if updateDTO.Name == nil && updateDTO.Dni == nil {
			result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: 0, PropertyUnitNumber: residentItem.PropertyUnitNumber, Error: "No se proporcionaron campos para actualizar"})
			result.Errors++
			continue
		}

		// Si el DNI cambia y ya existe en el negocio, no actualizar DNI (evitamos violar índice único)
		if updateDTO.Dni != nil && *updateDTO.Dni != existingResident.Dni {
			if exists, err := uc.repo.ExistsResidentByDni(ctx, businessID, *updateDTO.Dni, existingResident.ID); err == nil && exists {
				updateDTO.Dni = nil
			}
		}

		// Actualizar residente
		_, err = uc.UpdateResident(ctx, existingResident.ID, updateDTO)
		if err != nil {
			result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: 0, PropertyUnitNumber: residentItem.PropertyUnitNumber, Error: fmt.Sprintf("Error actualizando residente: %v", err)})
			result.Errors++
			continue
		}

		result.Updated++
		uc.logger.Info().
			Uint("business_id", businessID).
			Uint("resident_id", existingResident.ID).
			Str("unit_number", residentItem.PropertyUnitNumber).
			Msg("Residente actualizado exitosamente en edición masiva")
	}

	uc.logger.Info().
		Uint("business_id", businessID).
		Int("total_processed", result.TotalProcessed).
		Int("updated", result.Updated).
		Int("errors", result.Errors).
		Msg("Edición masiva de residentes completada")

	return result, nil
}
