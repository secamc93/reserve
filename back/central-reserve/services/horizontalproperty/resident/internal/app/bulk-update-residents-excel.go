package app

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/shared/log"

	"github.com/xuri/excelize/v2"
)

// BulkUpdateResidentsFromExcel procesa edición masiva de residentes desde un archivo Excel
func (uc *residentUseCase) BulkUpdateResidentsFromExcel(ctx context.Context, businessID uint, filePath string) (*domain.BulkUpdateResidentsResult, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "BulkUpdateResidentsFromExcel")
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	fmt.Printf("\n📊 [USE CASE - EDICION MASIVA RESIDENTES EXCEL]\n")
	fmt.Printf("   Business ID: %d\n", businessID)
	fmt.Printf("   Archivo: %s\n\n", filePath)

	result := &domain.BulkUpdateResidentsResult{ErrorDetails: []domain.BulkUpdateErrorDetail{}}

	// Abrir archivo Excel
	fmt.Printf("📖 [PASO 1] Abriendo archivo Excel...\n")
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] app/bulk-update-excel - Error abriendo Excel: %v\n", err)
		uc.logger.Error(ctx).Err(err).Str("file_path", filePath).Msg("Error abriendo archivo Excel")
		return nil, fmt.Errorf("error abriendo archivo Excel: %w", err)
	}
	defer f.Close()
	fmt.Printf("   ✅ Archivo abierto correctamente\n\n")

	// Obtener la primera hoja
	fmt.Printf("📋 [PASO 2] Obteniendo hojas del Excel...\n")
	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		fmt.Fprintf(os.Stderr, "[ERROR] app/bulk-update-excel - El Excel no tiene hojas\n")
		return nil, fmt.Errorf("el archivo Excel no tiene hojas")
	}
	sheetName := sheets[0]
	fmt.Printf("   ✅ Hoja encontrada: '%s'\n\n", sheetName)

	// Leer todas las filas
	fmt.Printf("📄 [PASO 3] Leyendo filas del Excel...\n")
	rows, err := f.GetRows(sheetName)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] app/bulk-update-excel - Error leyendo filas: %v\n", err)
		uc.logger.Error(ctx).Err(err).Str("sheet", sheetName).Msg("Error leyendo filas del Excel")
		return nil, fmt.Errorf("error leyendo filas del Excel: %w", err)
	}

	if len(rows) < 2 {
		fmt.Fprintf(os.Stderr, "[ERROR] app/bulk-update-excel - El Excel debe tener al menos 2 filas (encabezado + datos)\n")
		return nil, fmt.Errorf("el archivo Excel debe tener al menos 2 filas (encabezado + datos)")
	}

	fmt.Printf("   ✅ %d filas encontradas\n\n", len(rows))

	// Procesar encabezados
	fmt.Printf("📋 [PASO 4] Procesando encabezados...\n")
	headers := rows[0]
	unidadIndex := -1
	nombreIndex := -1
	dniIndex := -1

	for i, header := range headers {
		headerLower := strings.ToLower(strings.TrimSpace(header))
		switch headerLower {
		case "unidad", "unit", "property_unit", "property_unit_number":
			unidadIndex = i
		case "nombre", "name", "resident_name":
			nombreIndex = i
		case "dni", "document", "documento", "cedula":
			dniIndex = i
		}
	}

	if unidadIndex == -1 {
		fmt.Fprintf(os.Stderr, "[ERROR] app/bulk-update-excel - No se encontró columna 'unidad'\n")
		return nil, fmt.Errorf("no se encontró la columna 'unidad' en el Excel. Las columnas deben ser: unidad, nombre, dni")
	}

	if nombreIndex == -1 && dniIndex == -1 {
		fmt.Fprintf(os.Stderr, "[ERROR] app/bulk-update-excel - No se encontraron columnas 'nombre' o 'dni'\n")
		return nil, fmt.Errorf("debe haber al menos una columna 'nombre' o 'dni' en el Excel")
	}

	fmt.Printf("   ✅ Encabezados encontrados:\n")
	fmt.Printf("      - Unidad: columna %d\n", unidadIndex+1)
	if nombreIndex != -1 {
		fmt.Printf("      - Nombre: columna %d\n", nombreIndex+1)
	}
	if dniIndex != -1 {
		fmt.Printf("      - DNI: columna %d\n", dniIndex+1)
	}
	fmt.Printf("\n")

	// Obtener map de números de unidad a IDs
	fmt.Printf("🏠 [PASO 5] Obteniendo unidades de propiedad...\n")
	unitNumbers := make([]string, 0)
	for i := 1; i < len(rows); i++ {
		if len(rows[i]) > unidadIndex {
			unitNumber := strings.TrimSpace(rows[i][unidadIndex])
			if unitNumber != "" {
				unitNumbers = append(unitNumbers, unitNumber)
			}
		}
	}

	unitMap, err := uc.repo.GetPropertyUnitsByNumbers(ctx, businessID, unitNumbers)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] app/bulk-update-excel - Error obteniendo unidades: %v\n", err)
		uc.logger.Error().Err(err).Msg("Error obteniendo unidades de propiedad")
		return nil, fmt.Errorf("error obteniendo unidades de propiedad: %w", err)
	}
	fmt.Printf("   ✅ %d unidades encontradas en la base de datos\n\n", len(unitMap))

	// Construir lista de pares a actualizar (validación previa sin efectos)
	fmt.Printf("📝 [PASO 6] Validando filas y preparando actualizaciones...\n")
	var toUpdate []domain.ResidentUpdatePair
	directUpdates := 0
	pendingDni := make(map[string]uint)
	result.TotalProcessed = len(rows) - 1

	// Precargar residentes principales por unidad para no consultar por fila
	unitIDs := make([]uint, 0, len(unitMap))
	for _, id := range unitMap {
		unitIDs = append(unitIDs, id)
	}
	mainResidentsByUnit, err := uc.repo.GetMainResidentsByUnitIDs(ctx, businessID, unitIDs)
	if err != nil {
		return nil, fmt.Errorf("error precargando residentes principales: %w", err)
	}

	for _, resident := range mainResidentsByUnit {
		if resident.Dni != "" {
			pendingDni[strings.TrimSpace(resident.Dni)] = resident.ID
		}
	}

	for i := 1; i < len(rows); i++ {
		row := rows[i]
		rowNum := i + 1

		// Verificar que la fila tiene suficientes columnas
		if len(row) <= unidadIndex {
			result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: "", Error: "No tiene columna de unidad"})
			result.Errors++
			continue
		}

		// Obtener datos de la fila
		unitNumber := strings.TrimSpace(row[unidadIndex])
		if unitNumber == "" {
			result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: "Unidad vacía"})
			result.Errors++
			continue
		}

		var name *string
		if nombreIndex != -1 && len(row) > nombreIndex {
			nameStr := strings.TrimSpace(row[nombreIndex])
			if nameStr != "" {
				name = &nameStr
			}
		}

		var dni *string
		if dniIndex != -1 && len(row) > dniIndex {
			dniStr := strings.TrimSpace(row[dniIndex])
			if dniStr != "" {
				dni = &dniStr
			}
		}

		// Verificar que hay al menos un campo para actualizar
		if (name == nil || strings.TrimSpace(*name) == "") && (dni == nil || strings.TrimSpace(*dni) == "") {
			result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: "No hay campos para actualizar (nombre o dni)"})
			result.Errors++
			continue
		}

		// Verificar que la unidad existe
		unitID, exists := unitMap[unitNumber]
		if !exists {
			result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: "Unidad no encontrada"})
			result.Errors++
			continue
		}

		// Intentar obtener residente principal desde cache/prefetch
		existingResident, ok := mainResidentsByUnit[unitID]
		if !ok {
			// Fallback: buscar cualquier residente asociado a la unidad
			filters := domain.ResidentFiltersDTO{
				BusinessID:     businessID,
				PropertyUnitID: &unitID,
				Page:           1,
				PageSize:       1,
			}
			residentsList, err := uc.repo.ListResidents(ctx, filters)
			if err != nil {
				result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: fmt.Sprintf("Error buscando residente en la unidad: %v", err)})
				result.Errors++
				continue
			}

			if len(residentsList.Residents) > 0 {
				detail, err := uc.repo.GetResidentByID(ctx, residentsList.Residents[0].ID)
				if err != nil {
					result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: fmt.Sprintf("Error obteniendo residente asociado: %v", err)})
					result.Errors++
					continue
				}
				existingResident = *detail
				mainResidentsByUnit[unitID] = existingResident
				ok = true
			}
		}

		if !ok {
			nameValue := ""
			if name != nil {
				nameValue = strings.TrimSpace(*name)
			}

			if nameValue == "" {
				result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: "No se encontró residente y falta nombre para crearlo"})
				result.Errors++
				continue
			}

			var dniValue string
			if dni != nil {
				dniValue = strings.TrimSpace(*dni)
			}

			if dniValue != "" {
				existingByDni, err := uc.repo.GetResidentIDsByDni(ctx, businessID, []string{dniValue})
				if err != nil {
					result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: fmt.Sprintf("Error buscando residente por DNI: %v", err)})
					result.Errors++
					continue
				}

				if existingID, exists := existingByDni[dniValue]; exists {
					if assignedID, present := pendingDni[dniValue]; present && assignedID != existingID {
						result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: "El DNI ya está asignado a otro residente en esta importación"})
						result.Errors++
						continue
					}

					updateDTO := domain.UpdateResidentDTO{}
					if nameValue != "" {
						updateDTO.Name = &nameValue
					}

					if _, err := uc.UpdateResident(ctx, existingID, updateDTO); err != nil {
						result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: fmt.Sprintf("Error actualizando residente existente: %v", err)})
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
						result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: fmt.Sprintf("Error asociando residente existente a la unidad: %v", err)})
						result.Errors++
						continue
					}

					if detail, err := uc.repo.GetResidentByID(ctx, existingID); err == nil {
						mainResidentsByUnit[unitID] = *detail
						existingResident = *detail
						ok = true
					}

					pendingDni[dniValue] = existingID
					directUpdates++
					uc.logger.Info().
						Uint("business_id", businessID).
						Uint("resident_id", existingID).
						Str("unit_number", unitNumber).
						Msg("Residente existente asociado durante edición masiva desde Excel")

					continue
				}
			}

			newDni := dniValue
			allowEmptyDni := newDni == ""

			if newDni != "" {
				if assignedID, present := pendingDni[newDni]; present && assignedID != 0 {
					result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: "El DNI ya está asignado a otro residente en esta importación"})
					result.Errors++
					continue
				}
			}

			emailSeed := newDni
			if emailSeed == "" {
				emailSeed = fmt.Sprintf("sin_dni_%d_%d", businessID, unitID)
			} else {
				emailSeed = strings.ReplaceAll(newDni, " ", "")
			}

			createDTO := domain.CreateResidentDTO{
				BusinessID:       businessID,
				PropertyUnitID:   unitID,
				ResidentTypeID:   1,
				Name:             nameValue,
				Email:            fmt.Sprintf("%s_%d@residente.local", emailSeed, time.Now().UnixNano()),
				Phone:            "",
				Dni:              newDni,
				IsMainResident:   true,
				EmergencyContact: "",
				AllowEmptyDni:    allowEmptyDni,
			}

			created, err := uc.CreateResident(ctx, createDTO)
			if err != nil {
				result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: fmt.Sprintf("Error creando residente: %v", err)})
				result.Errors++
				continue
			}

			mainResidentsByUnit[unitID] = *created
			if newDni != "" {
				pendingDni[newDni] = created.ID
			}
			directUpdates++
			uc.logger.Info().
				Uint("business_id", businessID).
				Uint("resident_id", created.ID).
				Str("unit_number", unitNumber).
				Msg("Residente creado durante edición masiva desde Excel")
			continue
		}

		// A partir de aquí siempre tenemos un residente asociado (existingResident)

		if existingResident.Dni != "" {
			dniKey := strings.TrimSpace(existingResident.Dni)
			if dniKey != "" {
				if assignedID, exists := pendingDni[dniKey]; !exists || assignedID == existingResident.ID {
					pendingDni[dniKey] = existingResident.ID
				}
			}
		}

		// Crear DTO de actualización
		updateDTO := domain.UpdateResidentDTO{}

		// Solo actualizar campos que se proporcionaron
		if name != nil {
			updateDTO.Name = name
		}

		if dni != nil {
			dniValue := strings.TrimSpace(*dni)
			updateDTO.Dni = &dniValue
		}

		// Si el DNI cambia y ya existe en el negocio (otra persona/unidad), no lo actualizamos para evitar violar el índice único.
		if updateDTO.Dni != nil {
			newDni := strings.TrimSpace(*updateDTO.Dni)
			if newDni != "" && newDni != strings.TrimSpace(existingResident.Dni) {
				exists, err := uc.repo.ExistsResidentByDni(ctx, businessID, newDni, existingResident.ID)
				if err != nil {
					result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: fmt.Sprintf("Error validando DNI: %v", err)})
					result.Errors++
					continue
				}
				if exists {
					updateDTO.Dni = nil
				}
			}
		}

		if updateDTO.Dni != nil {
			newDni := strings.TrimSpace(*updateDTO.Dni)
			if newDni != "" {
				if assignedID, present := pendingDni[newDni]; present && assignedID != existingResident.ID {
					result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: "El DNI ya está asignado a otro residente en esta importación"})
					result.Errors++
					continue
				}
				pendingDni[newDni] = existingResident.ID
			}
		}

		toUpdate = append(toUpdate, domain.ResidentUpdatePair{ID: existingResident.ID, UpdateDTO: updateDTO})
	}

	// Aplicar actualizaciones batched (si hay)
	if len(toUpdate) > 0 {
		if err := uc.repo.UpdateResidentsInBatch(ctx, toUpdate); err != nil {
			return nil, fmt.Errorf("error aplicando actualización masiva: %w", err)
		}
	}

	result.Updated = len(toUpdate) + directUpdates

	if result.Errors > 0 {
		fmt.Printf("\n⚠️  Se encontraron %d errores. Se aplicaron cambios parciales.\n", result.Errors)
	} else {
		fmt.Printf("\n✅ [EDICION MASIVA EXCEL COMPLETADA]\n")
	}
	fmt.Printf("   Total procesados: %d\n", result.TotalProcessed)
	fmt.Printf("   Actualizados/creados: %d\n", result.Updated)
	fmt.Printf("   Errores: %d\n\n", result.Errors)

	if result.Errors > 0 {
		uc.logger.Warn().
			Uint("business_id", businessID).
			Str("file_path", filePath).
			Int("total_processed", result.TotalProcessed).
			Int("updated", result.Updated).
			Int("errors", result.Errors).
			Msg("Edición masiva de residentes desde Excel completada con errores")
	} else {
		uc.logger.Info().
			Uint("business_id", businessID).
			Str("file_path", filePath).
			Int("total_processed", result.TotalProcessed).
			Int("updated", result.Updated).
			Int("errors", result.Errors).
			Msg("Edición masiva de residentes desde Excel completada")
	}

	return result, nil
}

func generateTempDni(businessID, unitID uint, pending map[string]uint) string {
	for {
		temp := fmt.Sprintf("TMP-%d-%d-%d", businessID%1000, unitID%1000, time.Now().UnixNano()%1_000_000_000)
		if len(temp) > 30 {
			temp = temp[len(temp)-30:]
		}
		if _, exists := pending[temp]; !exists {
			return temp
		}
	}
}
