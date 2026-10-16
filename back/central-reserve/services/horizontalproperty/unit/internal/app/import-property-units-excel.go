package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/unit/internal/domain"
	"central_reserve/shared/log"
)

// defaultImportUnitType es el tipo de las unidades nuevas cuando el archivo no trae tipo.
const defaultImportUnitType = "apartment"

// PreviewPropertyUnitsImport valida el archivo sin guardar nada: estado por fila (lista, ya
// existe, error) y la suma de coeficientes que quedaría en la propiedad.
func (uc *propertyUnitUseCase) PreviewPropertyUnitsImport(ctx context.Context, businessID uint, filePath string) (*domain.ImportPreviewDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "PreviewPropertyUnitsImport")
	if businessID == 0 {
		return nil, domain.ErrBusinessIDRequired
	}
	rows, err := readExcelRows(filePath)
	if err != nil {
		return nil, err
	}
	columns, parsed := parseImportRows(rows)
	existing, err := uc.repo.ListExistingUnits(ctx, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", businessID).Msg("Error consultando unidades existentes")
		return nil, err
	}
	return classifyImportRows(columns, parsed, existing), nil
}

// ImportPropertyUnitsFromExcel importa unidades desde un Excel. Columnas reconocidas por
// encabezado: número, coeficiente, torre/bloque, piso y tipo (sin encabezados reconocibles:
// columna 1 = número, columna 2 = coeficiente). Las filas con error se omiten; las que ya
// existen se actualizan si opts.UpdateExisting, si no se omiten.
func (uc *propertyUnitUseCase) ImportPropertyUnitsFromExcel(ctx context.Context, businessID uint, filePath string, opts domain.ImportOptions) (*domain.ImportPropertyUnitsResult, error) {
	ctx = log.WithFunctionCtx(ctx, "ImportPropertyUnitsFromExcel")
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	preview, err := uc.PreviewPropertyUnitsImport(ctx, businessID, filePath)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Str("file_path", filePath).Msg("Error leyendo el archivo de importación")
		return nil, err
	}
	existing, err := uc.repo.ListExistingUnits(ctx, businessID)
	if err != nil {
		return nil, err
	}
	idByNumber := make(map[string]uint, len(existing))
	for _, e := range existing {
		idByNumber[normalizeText(e.Number)] = e.ID
	}

	result := &domain.ImportPropertyUnitsResult{Errors: make([]string, 0)}
	for _, r := range preview.Rows {
		result.Total++
		switch {
		case r.IsError():
			result.Skipped++
			result.Errors = append(result.Errors, fmt.Sprintf("Fila %d (%s): %s", r.Row, r.Number, r.Message))

		case r.Status == domain.ImportRowExists:
			if !opts.UpdateExisting {
				result.Skipped++
				result.Errors = append(result.Errors, fmt.Sprintf("Fila %d (%s): ya existe una unidad con este número", r.Row, r.Number))
				continue
			}
			dto := domain.UpdatePropertyUnitDTO{ParticipationCoefficient: r.Coefficient, Floor: r.Floor}
			if r.Block != "" {
				block := r.Block
				dto.Block = &block
			}
			if r.UnitType != "" {
				unitType := r.UnitType
				dto.UnitType = &unitType
			}
			if _, err := uc.UpdatePropertyUnit(ctx, idByNumber[normalizeText(r.Number)], dto); err != nil {
				result.Skipped++
				result.Errors = append(result.Errors, fmt.Sprintf("Fila %d (%s): error actualizando unidad - %s", r.Row, r.Number, err.Error()))
				continue
			}
			result.Updated++

		default:
			unitType := r.UnitType
			if unitType == "" {
				unitType = defaultImportUnitType
			}
			_, err := uc.CreatePropertyUnit(ctx, domain.CreatePropertyUnitDTO{
				BusinessID:               businessID,
				Number:                   r.Number,
				Block:                    r.Block,
				Floor:                    r.Floor,
				UnitType:                 unitType,
				ParticipationCoefficient: r.Coefficient,
			})
			if err != nil {
				result.Skipped++
				result.Errors = append(result.Errors, fmt.Sprintf("Fila %d (%s): error creando unidad - %s", r.Row, r.Number, err.Error()))
				continue
			}
			result.Created++
		}
	}

	uc.logger.Info(ctx).
		Int("total", result.Total).Int("created", result.Created).Int("updated", result.Updated).
		Int("skipped", result.Skipped).Msg("Importación de unidades completada")
	return result, nil
}
