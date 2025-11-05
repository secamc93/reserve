package usecasepropertyunit

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"

	"github.com/xuri/excelize/v2"
)

// ImportPropertyUnitsFromExcel importa unidades desde un archivo Excel
func (uc *propertyUnitUseCase) ImportPropertyUnitsFromExcel(ctx context.Context, businessID uint, filePath string) (*domain.ImportPropertyUnitsResult, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "ImportPropertyUnitsFromExcel")
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	fmt.Printf("\n📊 [USE CASE - INICIAR IMPORTACION EXCEL]\n")
	fmt.Printf("   Business ID: %d\n", businessID)
	fmt.Printf("   Archivo: %s\n\n", filePath)

	result := &domain.ImportPropertyUnitsResult{
		Errors: make([]string, 0),
	}

	// Abrir archivo Excel
	fmt.Printf("📖 [PASO 1] Abriendo archivo Excel...\n")
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - Error abriendo Excel: %v\n", err)
		uc.logger.Error(ctx).Err(err).Str("file_path", filePath).Msg("Error abriendo archivo Excel")
		return nil, fmt.Errorf("error abriendo archivo Excel: %w", err)
	}
	defer f.Close()
	fmt.Printf("   ✅ Archivo abierto correctamente\n\n")

	// Obtener la primera hoja
	fmt.Printf("📋 [PASO 2] Obteniendo hojas del Excel...\n")
	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - El Excel no tiene hojas\n")
		return nil, fmt.Errorf("el archivo Excel no tiene hojas")
	}
	sheetName := sheets[0]
	fmt.Printf("   ✅ Hoja encontrada: '%s'\n", sheetName)
	fmt.Printf("   Total de hojas: %d\n\n", len(sheets))

	// Leer todas las filas
	fmt.Printf("📄 [PASO 3] Leyendo filas del Excel...\n")
	rows, err := f.GetRows(sheetName)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - Error leyendo filas: sheet=%s, error=%v\n", sheetName, err)
		uc.logger.Error(ctx).Err(err).Str("sheet", sheetName).Msg("Error leyendo filas del Excel")
		return nil, fmt.Errorf("error leyendo filas del Excel: %w", err)
	}

	if len(rows) < 2 {
		fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - Excel sin datos: solo tiene %d filas\n", len(rows))
		return nil, fmt.Errorf("el archivo Excel debe tener al menos una fila de encabezados y una fila de datos")
	}

	fmt.Printf("   ✅ Total de filas leídas: %d (incluyendo encabezado)\n", len(rows))
	fmt.Printf("   Filas de datos: %d\n\n", len(rows)-1)

	uc.logger.Info(ctx).
		Str("file_path", filePath).
		Int("total_rows", len(rows)-1).
		Msg("Iniciando importación de unidades desde Excel")

	// Procesar filas (saltar encabezado)
	fmt.Printf("🔄 [PASO 4] Procesando filas del Excel...\n\n")
	for i, row := range rows {
		if i == 0 {
			// Validar encabezados
			fmt.Printf("📑 Fila %d (ENCABEZADO):\n", i+1)
			if len(row) < 2 {
				fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - Encabezados insuficientes: solo %d columnas\n", len(row))
				return nil, fmt.Errorf("el Excel debe tener al menos 2 columnas: número de unidad y coeficiente de participación")
			}
			for j, col := range row {
				fmt.Printf("   Columna %d: '%s'\n", j+1, col)
			}
			fmt.Printf("\n")
			continue
		}

		result.Total++
		fmt.Printf("📝 Procesando Fila %d/%d:\n", i+1, len(rows))

		// Validar que tenga al menos 2 columnas
		if len(row) < 2 {
			errMsg := fmt.Sprintf("Fila %d: debe tener al menos 2 columnas", i+1)
			fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - %s\n", errMsg)
			result.Errors = append(result.Errors, errMsg)
			result.Skipped++
			fmt.Printf("   ❌ OMITIDA: Faltan columnas\n\n")
			continue
		}

		// Leer datos
		number := strings.TrimSpace(row[0])
		coefficientStr := strings.TrimSpace(row[1])

		fmt.Printf("   Número: '%s'\n", number)
		fmt.Printf("   Coeficiente: '%s'\n", coefficientStr)

		// Validar número de unidad
		if number == "" {
			errMsg := fmt.Sprintf("Fila %d: el número de unidad está vacío", i+1)
			fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - %s\n", errMsg)
			result.Errors = append(result.Errors, errMsg)
			result.Skipped++
			fmt.Printf("   ❌ OMITIDA: Número vacío\n\n")
			continue
		}

		// Validar y convertir coeficiente
		if coefficientStr == "" {
			errMsg := fmt.Sprintf("Fila %d (%s): el coeficiente de participación está vacío", i+1, number)
			fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - %s\n", errMsg)
			result.Errors = append(result.Errors, errMsg)
			result.Skipped++
			fmt.Printf("   ❌ OMITIDA: Coeficiente vacío\n\n")
			continue
		}

		// Convertir coeficiente a float64
		coefficient, err := strconv.ParseFloat(coefficientStr, 64)
		if err != nil {
			errMsg := fmt.Sprintf("Fila %d (%s): el coeficiente '%s' no es un número válido", i+1, number, coefficientStr)
			fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - %s, error=%v\n", errMsg, err)
			result.Errors = append(result.Errors, errMsg)
			result.Skipped++
			fmt.Printf("   ❌ OMITIDA: Coeficiente inválido\n\n")
			continue
		}

		fmt.Printf("   Coeficiente parseado: %f\n", coefficient)

		// Validar que el coeficiente sea positivo
		if coefficient <= 0 {
			errMsg := fmt.Sprintf("Fila %d (%s): el coeficiente debe ser mayor a 0", i+1, number)
			fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - %s\n", errMsg)
			result.Errors = append(result.Errors, errMsg)
			result.Skipped++
			fmt.Printf("   ❌ OMITIDA: Coeficiente <= 0\n\n")
			continue
		}

		// Verificar si ya existe una unidad con ese número
		fmt.Printf("   🔍 Verificando duplicados...\n")
		exists, err := uc.repo.ExistsPropertyUnitByNumber(ctx, businessID, number, 0)
		if err != nil {
			errMsg := fmt.Sprintf("Fila %d (%s): error verificando duplicado", i+1, number)
			fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - %s, error=%v\n", errMsg, err)
			result.Errors = append(result.Errors, errMsg)
			result.Skipped++
			fmt.Printf("   ❌ OMITIDA: Error verificando duplicado\n\n")
			continue
		}

		if exists {
			errMsg := fmt.Sprintf("Fila %d (%s): ya existe una unidad con este número", i+1, number)
			fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - %s\n", errMsg)
			result.Errors = append(result.Errors, errMsg)
			result.Skipped++
			fmt.Printf("   ❌ OMITIDA: Ya existe\n\n")
			continue
		}

		// Crear DTO
		dto := domain.CreatePropertyUnitDTO{
			BusinessID:               businessID,
			Number:                   number,
			UnitType:                 "apartment", // Tipo por defecto
			ParticipationCoefficient: &coefficient,
		}

		// Crear unidad
		fmt.Printf("   💾 Creando unidad en BD...\n")
		created, err := uc.CreatePropertyUnit(ctx, dto)
		if err != nil {
			errMsg := fmt.Sprintf("Fila %d (%s): error creando unidad - %s", i+1, number, err.Error())
			fmt.Fprintf(os.Stderr, "[ERROR] usecasepropertyunit/import - %s\n", errMsg)
			result.Errors = append(result.Errors, errMsg)
			result.Skipped++
			uc.logger.Error(ctx).Err(err).Str("number", number).Msg("Error creando unidad desde Excel")
			fmt.Printf("   ❌ OMITIDA: Error creando en BD\n\n")
			continue
		}

		result.Created++
		fmt.Printf("   ✅ CREADA: ID=%d, Número=%s, Coef=%f\n\n", created.ID, number, coefficient)
		uc.logger.Debug(ctx).
			Uint("id", created.ID).
			Str("number", number).
			Float64("coefficient", coefficient).
			Msg("Unidad creada desde Excel")
	}

	fmt.Printf("\n════════════════════════════════════════════════\n")
	fmt.Printf("📊 [RESUMEN FINAL DE IMPORTACION]\n")
	fmt.Printf("════════════════════════════════════════════════\n")
	fmt.Printf("   Total de filas procesadas: %d\n", result.Total)
	fmt.Printf("   ✅ Unidades creadas: %d (%.1f%%)\n", result.Created, float64(result.Created)/float64(result.Total)*100)
	fmt.Printf("   ❌ Filas omitidas: %d (%.1f%%)\n", result.Skipped, float64(result.Skipped)/float64(result.Total)*100)
	fmt.Printf("   Errores: %d\n", len(result.Errors))
	fmt.Printf("════════════════════════════════════════════════\n\n")

	if len(result.Errors) > 0 {
		fmt.Printf("⚠️  [DETALLE DE ERRORES]:\n")
		for idx, errMsg := range result.Errors {
			fmt.Printf("   %d. %s\n", idx+1, errMsg)
		}
		fmt.Printf("\n")
	}

	uc.logger.Info(ctx).
		Int("total", result.Total).
		Int("created", result.Created).
		Int("skipped", result.Skipped).
		Int("errors", len(result.Errors)).
		Msg("✅ Importación de unidades completada")

	return result, nil
}
