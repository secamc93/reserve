package usecaseresident

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"

	"github.com/xuri/excelize/v2"
)

// BulkCreateResidentsFromExcel (antes ImportResidentsFromExcel) importa residentes desde Excel con validación "todo o nada"
// Nota: se mantiene el nombre del método público existente (ImportResidentsFromExcel) para no romper el handler.
// El archivo se renombra para reflejar que es creación masiva.
func (uc *residentUseCase) ImportResidentsFromExcel(ctx context.Context, businessID uint, filePath string) (*domain.ImportResidentsResult, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "ImportResidentsFromExcel")
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	fmt.Printf("\n📊 [USE CASE - CREACION MASIVA RESIDENTES DESDE EXCEL]\n")
	fmt.Printf("   Business ID: %d\n", businessID)
	fmt.Printf("   Archivo: %s\n\n", filePath)

	result := &domain.ImportResidentsResult{Errors: make([]string, 0)}

	// Abrir archivo Excel
	fmt.Printf("📖 [PASO 1] Abriendo archivo Excel...\n")
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-create - Error abriendo Excel: %v\n", err)
		uc.logger.Error(ctx).Err(err).Str("file_path", filePath).Msg("Error abriendo archivo Excel")
		return nil, fmt.Errorf("error abriendo archivo Excel: %w", err)
	}
	defer f.Close()
	fmt.Printf("   ✅ Archivo abierto correctamente\n\n")

	// Obtener la primera hoja
	fmt.Printf("📋 [PASO 2] Obteniendo hojas del Excel...\n")
	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-create - El Excel no tiene hojas\n")
		return nil, fmt.Errorf("el archivo Excel no tiene hojas")
	}
	sheetName := sheets[0]
	fmt.Printf("   ✅ Hoja encontrada: '%s'\n\n", sheetName)

	// Leer todas las filas
	fmt.Printf("📄 [PASO 3] Leyendo filas del Excel...\n")
	rows, err := f.GetRows(sheetName)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-create - Error leyendo filas: %v\n", err)
		uc.logger.Error(ctx).Err(err).Str("sheet", sheetName).Msg("Error leyendo filas del Excel")
		return nil, fmt.Errorf("error leyendo filas del Excel: %w", err)
	}

	if len(rows) < 2 {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-create - Excel sin datos: solo %d filas\n", len(rows))
		return nil, fmt.Errorf("el archivo Excel debe tener al menos una fila de encabezados y una fila de datos")
	}

	fmt.Printf("   ✅ Total de filas: %d (datos: %d)\n\n", len(rows), len(rows)-1)

	// FASE 1: VALIDACIÓN COMPLETA (sin crear nada aún)
	fmt.Printf("🔍 [FASE 1] VALIDACION COMPLETA DEL EXCEL\n")
	fmt.Printf("════════════════════════════════════════\n\n")

	type ResidentData struct {
		Row                int
		PropertyUnitNumber string
		Name               string
		Dni                string
	}

	residentsToCreate := make([]ResidentData, 0)
	unitNumbers := make([]string, 0)
	// dnisSeen eliminado - ahora permitimos DNIs duplicados en Excel para asociar múltiples unidades

	// Procesar y validar formato
	fmt.Printf("📝 [VALIDACION] Procesando filas...\n")
	for i, row := range rows {
		if i == 0 {
			// Validar encabezados
			fmt.Printf("📑 Fila %d (ENCABEZADO):\n", i+1)
			if len(row) < 3 {
				fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-create - Faltan columnas en encabezado\n")
				return nil, fmt.Errorf("el Excel debe tener al menos 3 columnas: Número de Unidad, Nombre Propietario, DNI")
			}
			for j, col := range row {
				fmt.Printf("   Columna %d: '%s'\n", j+1, col)
			}
			fmt.Printf("\n")
			continue
		}

		result.Total++

		// Validar columnas
		if len(row) < 3 {
			errMsg := fmt.Sprintf("Fila %d: debe tener al menos 3 columnas", i+1)
			result.Errors = append(result.Errors, errMsg)
			continue
		}

		// Leer datos
		unitNumber := strings.TrimSpace(row[0])
		name := strings.TrimSpace(row[1])
		dni := strings.TrimSpace(row[2])

		fmt.Printf("   Fila %d: Unidad='%s', Nombre='%s', DNI='%s'\n", i+1, unitNumber, name, dni)

		// Validaciones
		if unitNumber == "" {
			errMsg := fmt.Sprintf("Fila %d: el número de unidad está vacío", i+1)
			result.Errors = append(result.Errors, errMsg)
			continue
		}

		if name == "" {
			errMsg := fmt.Sprintf("Fila %d (Unidad %s): el nombre está vacío", i+1, unitNumber)
			result.Errors = append(result.Errors, errMsg)
			continue
		}

		// Guardar para crear después
		residentsToCreate = append(residentsToCreate, ResidentData{Row: i + 1, PropertyUnitNumber: unitNumber, Name: name, Dni: dni})
		unitNumbers = append(unitNumbers, unitNumber)
	}

	fmt.Printf("\n   ✅ Validación de formato completada\n")
	fmt.Printf("   Residentes válidos: %d\n", len(residentsToCreate))
	fmt.Printf("   Errores de formato: %d\n\n", len(result.Errors))

	// Si hay errores de formato, reportar en result.Errors pero continuar
	if len(result.Errors) > 0 {
		fmt.Fprintf(os.Stderr, "[WARN] usecaseresident/bulk-create - %d errores de formato encontrados (se reportan en respuesta)\n", len(result.Errors))
		fmt.Printf("⚠️  Errores de formato:\n")
		for _, err := range result.Errors {
			fmt.Printf("   - %s\n", err)
		}
		fmt.Printf("\n")
		// No abortar, continuar con el procesamiento
	}

	// FASE 2: VALIDAR QUE TODAS LAS UNIDADES EXISTAN
	fmt.Printf("🔍 [FASE 2] VALIDACION DE UNIDADES EN BD\n")
	fmt.Printf("════════════════════════════════════════\n")
	fmt.Printf("   Total de unidades a verificar: %d\n", len(unitNumbers))
	fmt.Printf("   Consultando base de datos...\n\n")

	// Obtener TODAS las unidades en UNA SOLA query
	unitMap, err := uc.repo.GetPropertyUnitsByNumbers(ctx, businessID, unitNumbers)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-create - Error obteniendo unidades: %v\n", err)
		uc.logger.Error().Err(err).Uint("business_id", businessID).Msg("Error obteniendo unidades por números")
		return nil, fmt.Errorf("error verificando unidades en base de datos: %w", err)
	}

	fmt.Printf("   ✅ Query ejecutada\n")
	fmt.Printf("   Unidades encontradas en BD: %d\n", len(unitMap))
	fmt.Printf("   Unidades esperadas: %d\n\n", len(unitNumbers))

	// Verificar que TODAS las unidades existan
	missingUnits := make([]string, 0)
	for _, resData := range residentsToCreate {
		if _, exists := unitMap[resData.PropertyUnitNumber]; !exists {
			errMsg := fmt.Sprintf("Fila %d: la unidad '%s' no existe en la base de datos", resData.Row, resData.PropertyUnitNumber)
			result.Errors = append(result.Errors, errMsg)
			missingUnits = append(missingUnits, resData.PropertyUnitNumber)
		}
	}

	// Si falta ALGUNA unidad, reportar en result.Errors pero continuar con las válidas
	if len(missingUnits) > 0 {
		fmt.Fprintf(os.Stderr, "[WARN] usecaseresident/bulk-create - %d unidades no existen en BD (se reportan en respuesta)\n", len(missingUnits))
		fmt.Printf("⚠️  Unidades no encontradas:\n")
		for _, unitNum := range missingUnits {
			fmt.Printf("   - %s\n", unitNum)
		}
		fmt.Printf("\n")

		// Filtrar residentes con unidades válidas
		validResidents := make([]ResidentData, 0)
		for _, resData := range residentsToCreate {
			if _, exists := unitMap[resData.PropertyUnitNumber]; exists {
				validResidents = append(validResidents, resData)
			}
		}
		residentsToCreate = validResidents
		fmt.Printf("   📝 Continuando con %d residentes válidos\n\n", len(residentsToCreate))
	}

	fmt.Printf("   ✅ Todas las unidades existen en BD\n\n")

	// FASE 3: VALIDAR DNIS DUPLICADOS EN BD
	fmt.Printf("🔍 [FASE 3] VALIDACION DE DNIS EN BD\n")
	fmt.Printf("════════════════════════════════════════\n\n")

	// Detectar DNIs existentes para asociar a nuevas unidades (multi-unidad)
	// Deduplicar DNIs del Excel para consultar BD una sola vez
	dniSet := make(map[string]bool)
	for _, rd := range residentsToCreate {
		if rd.Dni != "" {
			dniSet[rd.Dni] = true
		}
	}
	dniList := make([]string, 0, len(dniSet))
	for dni := range dniSet {
		dniList = append(dniList, dni)
	}
	existingByDni, err := uc.repo.GetResidentIDsByDni(ctx, businessID, dniList)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-create - Error precargando DNIs: %v\n", err)
		return nil, fmt.Errorf("error verificando DNIs en base de datos: %w", err)
	}

	fmt.Printf("   📊 DNIs únicos en Excel: %d\n", len(dniList))
	fmt.Printf("   📊 DNIs existentes en BD: %d\n", len(existingByDni))
	fmt.Printf("   📊 DNIs nuevos a crear: %d\n\n", len(dniList)-len(existingByDni))

	// Obtener el ResidentTypeID para "Propietario"
	// TODO: Esto debería venir de una constante o configuración
	residentTypeID := uint(1) // Asumiendo que 1 = Propietario

	// FASE 4: CREAR/ASOCIAR TODOS LOS RESIDENTES (deduplicando por DNI)
	fmt.Printf("💾 [FASE 4] CREACION MASIVA DE RESIDENTES\n")
	fmt.Printf("════════════════════════════════════════\n")

	// 4.1 Agrupar filas por DNI: primera aparición será principal; el resto adicionales
	type aggregated struct {
		name  string
		units []struct {
			unitID uint
			isMain bool
		}
	}
	dniToAgg := make(map[string]*aggregated)
	for _, rd := range residentsToCreate {
		unitID := unitMap[rd.PropertyUnitNumber]
		key := rd.Dni
		if key == "" {
			key = fmt.Sprintf("__empty__row_%d", rd.Row)
		}
		if agg, ok := dniToAgg[key]; ok {
			agg.units = append(agg.units, struct {
				unitID uint
				isMain bool
			}{unitID: unitID, isMain: false})
		} else {
			first := &aggregated{name: rd.Name}
			first.units = append(first.units, struct {
				unitID uint
				isMain bool
			}{unitID: unitID, isMain: true})
			dniToAgg[key] = first
		}
	}

	// 4.2 Preparar creación: 1 residente por DNI nuevo; para existentes solo pivotes
	toCreate := make([]*domain.Resident, 0, len(dniToAgg))
	toPivot := make([]domain.ResidentUnit, 0, len(residentsToCreate))
	type blankEntry struct {
		agg *aggregated
	}
	blankEntries := make([]blankEntry, 0)

	for key, agg := range dniToAgg {
		dni := key
		if strings.HasPrefix(dni, "__empty__row_") {
			blankEntries = append(blankEntries, blankEntry{agg: agg})
			continue
		}

		if existingID, ok := existingByDni[dni]; ok {
			for _, u := range agg.units {
				toPivot = append(toPivot, domain.ResidentUnit{BusinessID: businessID, ResidentID: existingID, PropertyUnitID: u.unitID, IsMainResident: u.isMain})
			}
			continue
		}

		emailSeed := strings.ReplaceAll(dni, " ", "")
		if emailSeed == "" {
			emailSeed = fmt.Sprintf("sin_dni_%d", time.Now().UnixNano())
		}

		toCreate = append(toCreate, &domain.Resident{
			BusinessID:     businessID,
			ResidentTypeID: residentTypeID,
			Name:           agg.name,
			Email:          fmt.Sprintf("%s@residente.local", emailSeed),
			Dni:            dni,
			IsActive:       true,
		})
	}

	fmt.Printf("   DNIs únicos a crear (no vacíos): %d\n", len(toCreate))

	if len(toCreate) > 0 {
		if err := uc.repo.CreateResidentsInBatch(ctx, toCreate); err != nil {
			fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-create - Error creando residentes: %v\n", err)
			uc.logger.Error().Err(err).Uint("business_id", businessID).Msg("Error creando residentes en batch")
			result.Errors = append(result.Errors, fmt.Sprintf("Error creando residentes: %v", err))
			return result, nil
		}
		result.Created += len(toCreate)

		newDnis := make([]string, 0, len(dniToAgg))
		for key := range dniToAgg {
			if strings.HasPrefix(key, "__empty__row_") {
				continue
			}
			if _, exists := existingByDni[key]; !exists {
				newDnis = append(newDnis, key)
			}
		}

		createdMap, err := uc.repo.GetResidentIDsByDni(ctx, businessID, newDnis)
		if err != nil {
			fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-create - Error releyendo IDs de DNIs creados: %v\n", err)
			result.Errors = append(result.Errors, fmt.Sprintf("Error leyendo IDs post-creación: %v", err))
			return result, nil
		}

		for key, agg := range dniToAgg {
			if strings.HasPrefix(key, "__empty__row_") {
				continue
			}
			if id, ok := createdMap[key]; ok {
				for _, u := range agg.units {
					toPivot = append(toPivot, domain.ResidentUnit{BusinessID: businessID, ResidentID: id, PropertyUnitID: u.unitID, IsMainResident: u.isMain})
				}
			}
		}
	}

	for _, entry := range blankEntries {
		agg := entry.agg
		if len(agg.units) == 0 {
			continue
		}
		firstUnit := agg.units[0]
		emailSeed := fmt.Sprintf("sin_dni_%d", time.Now().UnixNano())
		createDTO := domain.CreateResidentDTO{
			BusinessID:       businessID,
			PropertyUnitID:   firstUnit.unitID,
			ResidentTypeID:   residentTypeID,
			Name:             agg.name,
			Email:            fmt.Sprintf("%s@residente.local", emailSeed),
			Dni:              "",
			IsMainResident:   firstUnit.isMain,
			AllowEmptyDni:    true,
			EmergencyContact: "",
		}

		created, err := uc.CreateResident(ctx, createDTO)
		if err != nil {
			fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-create - Error creando residente sin DNI: %v\n", err)
			result.Errors = append(result.Errors, fmt.Sprintf("Error creando residente sin DNI (unidad %d): %v", firstUnit.unitID, err))
			return result, nil
		}
		result.Created++

		if len(agg.units) > 1 {
			for _, u := range agg.units[1:] {
				toPivot = append(toPivot, domain.ResidentUnit{BusinessID: businessID, ResidentID: created.ID, PropertyUnitID: u.unitID, IsMainResident: u.isMain})
			}
		}
	}

	if len(toPivot) > 0 {
		if err := uc.repo.CreateResidentUnitsInBatch(ctx, toPivot); err != nil {
			fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/bulk-create - Error creando pivotes: %v\n", err)
			result.Errors = append(result.Errors, fmt.Sprintf("Error creando asociaciones residente-unidad: %v", err))
			return result, nil
		}
	}

	fmt.Printf("   ✅ Transacción completada exitosamente\n\n")

	fmt.Printf("\n════════════════════════════════════════════════\n")
	fmt.Printf("📊 [RESUMEN FINAL DE IMPORTACION]\n")
	fmt.Printf("════════════════════════════════════════════════\n")
	fmt.Printf("   Total de filas procesadas: %d\n", result.Total)
	fmt.Printf("   ✅ Residentes creados: %d (100%%)\n", result.Created)
	fmt.Printf("   Errores: %d\n", len(result.Errors))
	fmt.Printf("════════════════════════════════════════════════\n\n")

	uc.logger.Info().Uint("business_id", businessID).Int("total", result.Total).Int("created", result.Created).Int("errors", len(result.Errors)).Msg("✅ Importación de residentes completada")

	return result, nil
}
