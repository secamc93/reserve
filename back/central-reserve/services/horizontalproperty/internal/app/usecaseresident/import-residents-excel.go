package usecaseresident

import (
	"context"
	"fmt"
	"os"
	"strings"

	"central_reserve/services/horizontalproperty/internal/domain"

	"github.com/xuri/excelize/v2"
)

// ImportResidentsFromExcel importa residentes desde un archivo Excel con validación "todo o nada"
func (uc *residentUseCase) ImportResidentsFromExcel(ctx context.Context, businessID uint, filePath string) (*domain.ImportResidentsResult, error) {
	fmt.Printf("\n📊 [USE CASE - INICIAR IMPORTACION RESIDENTES EXCEL]\n")
	fmt.Printf("   Business ID: %d\n", businessID)
	fmt.Printf("   Archivo: %s\n\n", filePath)

	result := &domain.ImportResidentsResult{
		Errors: make([]string, 0),
	}

	// Abrir archivo Excel
	fmt.Printf("📖 [PASO 1] Abriendo archivo Excel...\n")
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/import - Error abriendo Excel: %v\n", err)
		uc.logger.Error().Err(err).Str("file_path", filePath).Msg("Error abriendo archivo Excel")
		return nil, fmt.Errorf("error abriendo archivo Excel: %w", err)
	}
	defer f.Close()
	fmt.Printf("   ✅ Archivo abierto correctamente\n\n")

	// Obtener la primera hoja
	fmt.Printf("📋 [PASO 2] Obteniendo hojas del Excel...\n")
	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/import - El Excel no tiene hojas\n")
		return nil, fmt.Errorf("el archivo Excel no tiene hojas")
	}
	sheetName := sheets[0]
	fmt.Printf("   ✅ Hoja encontrada: '%s'\n\n", sheetName)

	// Leer todas las filas
	fmt.Printf("📄 [PASO 3] Leyendo filas del Excel...\n")
	rows, err := f.GetRows(sheetName)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/import - Error leyendo filas: %v\n", err)
		uc.logger.Error().Err(err).Str("sheet", sheetName).Msg("Error leyendo filas del Excel")
		return nil, fmt.Errorf("error leyendo filas del Excel: %w", err)
	}

	if len(rows) < 2 {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/import - Excel sin datos: solo %d filas\n", len(rows))
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
	dnisSeen := make(map[string]int) // map[dni]row_number para detectar duplicados en Excel

	// Procesar y validar formato
	fmt.Printf("📝 [VALIDACION] Procesando filas...\n")
	for i, row := range rows {
		if i == 0 {
			// Validar encabezados
			fmt.Printf("📑 Fila %d (ENCABEZADO):\n", i+1)
			if len(row) < 3 {
				fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/import - Faltan columnas en encabezado\n")
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

		if dni == "" {
			errMsg := fmt.Sprintf("Fila %d (Unidad %s): el DNI está vacío", i+1, unitNumber)
			result.Errors = append(result.Errors, errMsg)
			continue
		}

		// Detectar DNI duplicado en el Excel
		if prevRow, exists := dnisSeen[dni]; exists {
			errMsg := fmt.Sprintf("Fila %d (Unidad %s): DNI '%s' duplicado (ya aparece en fila %d)", i+1, unitNumber, dni, prevRow)
			result.Errors = append(result.Errors, errMsg)
			continue
		}
		dnisSeen[dni] = i + 1

		// Guardar para crear después
		residentsToCreate = append(residentsToCreate, ResidentData{
			Row:                i + 1,
			PropertyUnitNumber: unitNumber,
			Name:               name,
			Dni:                dni,
		})

		unitNumbers = append(unitNumbers, unitNumber)
	}

	fmt.Printf("\n   ✅ Validación de formato completada\n")
	fmt.Printf("   Residentes válidos: %d\n", len(residentsToCreate))
	fmt.Printf("   Errores de formato: %d\n\n", len(result.Errors))

	// Si hay errores de formato, abortar TODO
	if len(result.Errors) > 0 {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/import - Errores de formato encontrados, abortando importación\n")
		return result, fmt.Errorf("el Excel tiene %d errores de formato. Corrija los errores e intente nuevamente", len(result.Errors))
	}

	// FASE 2: VALIDAR QUE TODAS LAS UNIDADES EXISTAN
	fmt.Printf("🔍 [FASE 2] VALIDACION DE UNIDADES EN BD\n")
	fmt.Printf("════════════════════════════════════════\n")
	fmt.Printf("   Total de unidades a verificar: %d\n", len(unitNumbers))
	fmt.Printf("   Consultando base de datos...\n\n")

	// Obtener TODAS las unidades en UNA SOLA query
	unitMap, err := uc.repo.GetPropertyUnitsByNumbers(ctx, businessID, unitNumbers)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/import - Error obteniendo unidades: %v\n", err)
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

	// Si falta ALGUNA unidad, abortar TODO
	if len(missingUnits) > 0 {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/import - %d unidades no existen en BD\n", len(missingUnits))
		fmt.Printf("❌ [ERROR] Unidades no encontradas:\n")
		for _, unitNum := range missingUnits {
			fmt.Printf("   - %s\n", unitNum)
		}
		fmt.Printf("\n")
		return result, fmt.Errorf("❌ %d unidades no existen. DEBE crear las unidades primero. Ningún residente fue creado", len(missingUnits))
	}

	fmt.Printf("   ✅ Todas las unidades existen en BD\n\n")

	// FASE 3: VALIDAR DNIS DUPLICADOS EN BD
	fmt.Printf("🔍 [FASE 3] VALIDACION DE DNIS EN BD\n")
	fmt.Printf("════════════════════════════════════════\n\n")

	duplicateDNIs := make([]string, 0)
	for _, resData := range residentsToCreate {
		exists, err := uc.repo.ExistsResidentByDni(ctx, businessID, resData.Dni, 0)
		if err != nil {
			fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/import - Error verificando DNI: %v\n", err)
			return nil, fmt.Errorf("error verificando DNIs en base de datos: %w", err)
		}
		if exists {
			errMsg := fmt.Sprintf("Fila %d (Unidad %s): el DNI '%s' ya existe en la base de datos", resData.Row, resData.PropertyUnitNumber, resData.Dni)
			result.Errors = append(result.Errors, errMsg)
			duplicateDNIs = append(duplicateDNIs, resData.Dni)
		}
	}

	// Si hay DNIs duplicados, abortar TODO
	if len(duplicateDNIs) > 0 {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/import - %d DNIs duplicados en BD\n", len(duplicateDNIs))
		fmt.Printf("❌ [ERROR] DNIs duplicados:\n")
		for _, dni := range duplicateDNIs {
			fmt.Printf("   - %s\n", dni)
		}
		fmt.Printf("\n")
		return result, fmt.Errorf("❌ %d DNIs ya existen en la base de datos. Ningún residente fue creado", len(duplicateDNIs))
	}

	fmt.Printf("   ✅ Todos los DNIs son únicos\n\n")

	// Obtener el ResidentTypeID para "Propietario"
	// TODO: Esto debería venir de una constante o configuración
	residentTypeID := uint(1) // Asumiendo que 1 = Propietario

	// FASE 4: CREAR TODOS LOS RESIDENTES
	fmt.Printf("💾 [FASE 4] CREACION MASIVA DE RESIDENTES\n")
	fmt.Printf("════════════════════════════════════════\n")
	fmt.Printf("   Total a crear: %d\n\n", len(residentsToCreate))

	residents := make([]*domain.Resident, len(residentsToCreate))
	for i, resData := range residentsToCreate {
		unitID := unitMap[resData.PropertyUnitNumber]

		residents[i] = &domain.Resident{
			BusinessID:     businessID,
			PropertyUnitID: unitID,
			ResidentTypeID: residentTypeID,
			Name:           resData.Name,
			Dni:            resData.Dni,
			IsMainResident: true, // Por defecto, el importado es el principal
			IsActive:       true,
		}

		fmt.Printf("   %d. Unidad=%s (ID=%d), Nombre=%s, DNI=%s\n", i+1, resData.PropertyUnitNumber, unitID, resData.Name, resData.Dni)
	}

	fmt.Printf("\n   💾 Creando %d residentes en transacción...\n", len(residents))

	// Crear TODOS en una transacción (todo o nada)
	err = uc.repo.CreateResidentsInBatch(ctx, residents)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] usecaseresident/import - Error en transacción: %v\n", err)
		uc.logger.Error().Err(err).Uint("business_id", businessID).Msg("Error creando residentes en batch")
		return nil, fmt.Errorf("❌ error creando residentes (transacción revertida): %w", err)
	}

	result.Created = len(residents)

	fmt.Printf("   ✅ Transacción completada exitosamente\n\n")

	fmt.Printf("\n════════════════════════════════════════════════\n")
	fmt.Printf("📊 [RESUMEN FINAL DE IMPORTACION]\n")
	fmt.Printf("════════════════════════════════════════════════\n")
	fmt.Printf("   Total de filas procesadas: %d\n", result.Total)
	fmt.Printf("   ✅ Residentes creados: %d (100%%)\n", result.Created)
	fmt.Printf("   Errores: %d\n", len(result.Errors))
	fmt.Printf("════════════════════════════════════════════════\n\n")

	uc.logger.Info().
		Uint("business_id", businessID).
		Int("total", result.Total).
		Int("created", result.Created).
		Int("errors", len(result.Errors)).
		Msg("✅ Importación de residentes completada")

	return result, nil
}
