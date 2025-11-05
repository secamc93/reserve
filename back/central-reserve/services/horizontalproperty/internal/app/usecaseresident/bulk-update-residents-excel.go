package usecaseresident

import (
	"context"
	"fmt"
	"os"
	"strings"

	"central_reserve/services/horizontalproperty/internal/domain"
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
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-update-excel - Error abriendo Excel: %v\n", err)
		uc.logger.Error(ctx).Err(err).Str("file_path", filePath).Msg("Error abriendo archivo Excel")
		return nil, fmt.Errorf("error abriendo archivo Excel: %w", err)
	}
	defer f.Close()
	fmt.Printf("   ✅ Archivo abierto correctamente\n\n")

	// Obtener la primera hoja
	fmt.Printf("📋 [PASO 2] Obteniendo hojas del Excel...\n")
	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-update-excel - El Excel no tiene hojas\n")
		return nil, fmt.Errorf("el archivo Excel no tiene hojas")
	}
	sheetName := sheets[0]
	fmt.Printf("   ✅ Hoja encontrada: '%s'\n\n", sheetName)

	// Leer todas las filas
	fmt.Printf("📄 [PASO 3] Leyendo filas del Excel...\n")
	rows, err := f.GetRows(sheetName)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-update-excel - Error leyendo filas: %v\n", err)
		uc.logger.Error(ctx).Err(err).Str("sheet", sheetName).Msg("Error leyendo filas del Excel")
		return nil, fmt.Errorf("error leyendo filas del Excel: %w", err)
	}

	if len(rows) < 2 {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-update-excel - El Excel debe tener al menos 2 filas (encabezado + datos)\n")
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
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-update-excel - No se encontró columna 'unidad'\n")
		return nil, fmt.Errorf("no se encontró la columna 'unidad' en el Excel. Las columnas deben ser: unidad, nombre, dni")
	}

	if nombreIndex == -1 && dniIndex == -1 {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-update-excel - No se encontraron columnas 'nombre' o 'dni'\n")
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
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-update-excel - Error obteniendo unidades: %v\n", err)
		uc.logger.Error().Err(err).Msg("Error obteniendo unidades de propiedad")
		return nil, fmt.Errorf("error obteniendo unidades de propiedad: %w", err)
	}
	fmt.Printf("   ✅ %d unidades encontradas en la base de datos\n\n", len(unitMap))

	// Construir lista de pares a actualizar (validación previa sin efectos)
	fmt.Printf("📝 [PASO 6] Validando filas y preparando actualizaciones...\n")
	var toUpdate []domain.ResidentUpdatePair
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
		if name == nil && dni == nil {
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

		// Traer residente principal desde cache preload
		existingResident, ok := mainResidentsByUnit[unitID]
		if !ok {
			result.ErrorDetails = append(result.ErrorDetails, domain.BulkUpdateErrorDetail{Row: rowNum, PropertyUnitNumber: unitNumber, Error: "No se encontró residente principal en la unidad"})
			result.Errors++
			continue
		}

		// Crear DTO de actualización
		updateDTO := domain.UpdateResidentDTO{}

		// Solo actualizar campos que se proporcionaron
		if name != nil {
			updateDTO.Name = name
		}

		if dni != nil {
			updateDTO.Dni = dni
		}

		// Si el DNI cambia y ya existe en el negocio (otra persona/unidad), no lo actualizamos para evitar violar el índice único.
		if updateDTO.Dni != nil && *updateDTO.Dni != existingResident.Dni {
			exists, err := uc.repo.ExistsResidentByDni(ctx, businessID, *updateDTO.Dni, existingResident.ID)
			if err == nil && exists {
				// No es error: mantenemos el DNI actual y solo actualizamos otros campos (p.ej. nombre)
				updateDTO.Dni = nil
			}
		}

		toUpdate = append(toUpdate, domain.ResidentUpdatePair{ID: existingResident.ID, UpdateDTO: updateDTO})
	}

	// Si hay errores, abortar sin aplicar cambios
	if result.Errors > 0 {
		fmt.Printf("\n⛔ Se encontraron %d errores. No se aplicaron cambios.\n", result.Errors)
		uc.logger.Warn().Uint("business_id", businessID).Int("errors", result.Errors).Msg("Bulk update abortado por errores")
		return result, nil
	}

	// Aplicar en una sola transacción
	if err := uc.repo.UpdateResidentsInBatch(ctx, toUpdate); err != nil {
		return nil, fmt.Errorf("error aplicando actualización masiva: %w", err)
	}
	result.Updated = len(toUpdate)

	fmt.Printf("\n✅ [EDICION MASIVA EXCEL COMPLETADA]\n")
	fmt.Printf("   Total procesados: %d\n", result.TotalProcessed)
	fmt.Printf("   Actualizados: %d\n", result.Updated)
	fmt.Printf("   Errores: %d\n\n", result.Errors)

	uc.logger.Info().
		Uint("business_id", businessID).
		Str("file_path", filePath).
		Int("total_processed", result.TotalProcessed).
		Int("updated", result.Updated).
		Int("errors", result.Errors).
		Msg("Edición masiva de residentes desde Excel completada")

	return result, nil
}
