package app

import (
	"context"
	"fmt"
	"strings"

	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/shared/log"
)

func (uc *residentUseCase) BulkUpdateResidents(ctx context.Context, businessID uint, request domain.BulkUpdateResidentsRequest) (*domain.BulkUpdateResidentsResult, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "BulkUpdateResidents")
	ctx = log.WithBusinessIDCtx(ctx, businessID)

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
		uc.logger.Error(ctx).Err(err).Int("total_units", len(unitNumbers)).Msg("Error obteniendo unidades de propiedad")
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
			// Si no existe residente asociado a la unidad, intentar crearlo con los datos proporcionados
			if residentItem.Name == nil || strings.TrimSpace(*residentItem.Name) == "" || residentItem.Dni == nil || strings.TrimSpace(*residentItem.Dni) == "" {
				result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: 0, PropertyUnitNumber: residentItem.PropertyUnitNumber, Error: "No se encontró residente en la unidad y se requieren nombre y DNI para crearlo"})
				result.Errors++
				continue
			}

			name := strings.TrimSpace(*residentItem.Name)
			dni := strings.TrimSpace(*residentItem.Dni)

			// Si el DNI ya existe, actualizar el residente existente y asociarlo a la unidad
			existingByDni, err := uc.repo.GetResidentIDsByDni(ctx, businessID, []string{dni})
			if err != nil {
				result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: 0, PropertyUnitNumber: residentItem.PropertyUnitNumber, Error: fmt.Sprintf("Error buscando residente por DNI: %v", err)})
				result.Errors++
				continue
			}

			if existingID, ok := existingByDni[dni]; ok {
				updateDTO := domain.UpdateResidentDTO{Name: &name}
				if _, err := uc.UpdateResident(ctx, existingID, updateDTO); err != nil {
					result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: 0, PropertyUnitNumber: residentItem.PropertyUnitNumber, Error: fmt.Sprintf("Error actualizando residente existente: %v", err)})
					result.Errors++
					continue
				}

				pivot := domain.ResidentUnit{
					BusinessID:     businessID,
					ResidentID:     existingID,
					PropertyUnitID: unitID,
					IsMainResident: true,
				}

				if err := uc.repo.CreateResidentUnitsInBatch(ctx, []domain.ResidentUnit{pivot}); err != nil && !isDuplicatePivotError(err) {
					result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: 0, PropertyUnitNumber: residentItem.PropertyUnitNumber, Error: fmt.Sprintf("Error asociando residente existente a la unidad: %v", err)})
					result.Errors++
					continue
				}

				result.Updated++
				uc.logger.Info().
					Uint("business_id", businessID).
					Uint("resident_id", existingID).
					Str("unit_number", residentItem.PropertyUnitNumber).
					Msg("Residente existente asociado y actualizado durante edición masiva")
				continue
			}

			email := fmt.Sprintf("%s@residente.local", strings.ReplaceAll(dni, " ", ""))

			createDTO := domain.CreateResidentDTO{
				BusinessID:       businessID,
				PropertyUnitID:   unitID,
				ResidentTypeID:   1, // Propietario por defecto
				Name:             name,
				Email:            email,
				Phone:            "",
				Dni:              dni,
				IsMainResident:   true,
				EmergencyContact: "",
				AllowEmptyDni:    dni == "",
			}

			createdResident, err := uc.CreateResident(ctx, createDTO)
			if err != nil {
				result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: 0, PropertyUnitNumber: residentItem.PropertyUnitNumber, Error: fmt.Sprintf("Error creando residente: %v", err)})
				result.Errors++
				continue
			}

			result.Updated++
			uc.logger.Info().
				Uint("business_id", businessID).
				Uint("resident_id", createdResident.ID).
				Str("unit_number", residentItem.PropertyUnitNumber).
				Msg("Residente creado durante edición masiva")
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

		if residentItem.Dni != nil {
			dniValue := strings.TrimSpace(*residentItem.Dni)
			updateDTO.Dni = &dniValue
		}

		// Si no hay campos para actualizar, saltar
		if updateDTO.Name == nil && updateDTO.Dni == nil {
			result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: 0, PropertyUnitNumber: residentItem.PropertyUnitNumber, Error: "No se proporcionaron campos para actualizar"})
			result.Errors++
			continue
		}

		// Si el DNI cambia y ya existe en el negocio, no actualizar DNI (evitamos violar índice único)
		if updateDTO.Dni != nil {
			newDni := strings.TrimSpace(*updateDTO.Dni)
			if newDni != "" && newDni != existingResident.Dni {
				if exists, err := uc.repo.ExistsResidentByDni(ctx, businessID, newDni, existingResident.ID); err == nil && exists {
					updateDTO.Dni = nil
				}
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

func isDuplicatePivotError(err error) bool {
	if err == nil {
		return false
	}
	return strings.Contains(err.Error(), "duplicate key value") || strings.Contains(err.Error(), "violates unique constraint")
}
