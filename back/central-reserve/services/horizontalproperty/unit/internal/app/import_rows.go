package app

import (
	"fmt"
	"strconv"
	"strings"

	"central_reserve/services/horizontalproperty/unit/internal/domain"

	"github.com/xuri/excelize/v2"
)

// readExcelRows lee la primera hoja del Excel (encabezado + al menos una fila de datos).
func readExcelRows(filePath string) ([][]string, error) {
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("%w: no se pudo abrir el Excel (%v)", domain.ErrInvalidImportFile, err)
	}
	defer f.Close()
	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		return nil, fmt.Errorf("%w: el archivo Excel no tiene hojas", domain.ErrInvalidImportFile)
	}
	rows, err := f.GetRows(sheets[0])
	if err != nil {
		return nil, fmt.Errorf("%w: no se pudieron leer las filas (%v)", domain.ErrInvalidImportFile, err)
	}
	if len(rows) < 2 {
		return nil, fmt.Errorf("%w: debe tener una fila de encabezados y al menos una fila de datos", domain.ErrInvalidImportFile)
	}
	if len(rows[0]) < 2 {
		return nil, fmt.Errorf("%w: debe tener al menos 2 columnas (número de unidad y coeficiente)", domain.ErrInvalidImportFile)
	}
	return rows, nil
}

// normalizeText pasa a minúsculas y quita tildes y espacios de los extremos ("Número" → "numero").
func normalizeText(s string) string {
	return accentReplacer.Replace(strings.ToLower(strings.TrimSpace(s)))
}

var accentReplacer = strings.NewReplacer("á", "a", "é", "e", "í", "i", "ó", "o", "ú", "u", "ü", "u", "ñ", "n")

// unitTypeAliases traduce el tipo escrito en el archivo al código del back.
var unitTypeAliases = map[string]string{
	"apartment": "apartment", "apartamento": "apartment", "apto": "apartment",
	"house": "house", "casa": "house",
	"office": "office", "oficina": "office",
	"commercial": "commercial", "local": "commercial", "local comercial": "commercial", "comercial": "commercial",
	"parking": "parking", "parqueadero": "parking",
	"storage": "storage", "deposito": "storage", "bodega": "storage",
	"penthouse": "penthouse",
}

type importColumns struct {
	number, coefficient, block, floor, unitType int
}

// detectColumns ubica las columnas por su encabezado. Si no reconoce el número, usa el formato
// clásico: columna 1 = número, columna 2 = coeficiente.
func detectColumns(header []string) importColumns {
	cols := importColumns{number: -1, coefficient: -1, block: -1, floor: -1, unitType: -1}
	for i, h := range header {
		switch normalizeText(h) {
		case "numero", "unidad", "number", "no", "no.", "numero de unidad":
			if cols.number < 0 {
				cols.number = i
			}
		case "coeficiente", "coef", "coef.", "coefficient", "coeficiente de copropiedad", "participacion":
			cols.coefficient = i
		case "torre", "bloque", "block", "torre/bloque", "bloque/torre":
			cols.block = i
		case "piso", "floor":
			cols.floor = i
		case "tipo", "type", "tipo de unidad":
			cols.unitType = i
		}
	}
	if cols.number < 0 || cols.coefficient < 0 {
		cols.number, cols.coefficient = 0, 1
	}
	return cols
}

func cell(row []string, i int) string {
	if i < 0 || i >= len(row) {
		return ""
	}
	return strings.TrimSpace(row[i])
}

// parseCoefficient acepta coma o punto decimal y un "%" final ("0,503", "0.503 %").
func parseCoefficient(raw string) (float64, error) {
	v := strings.TrimSpace(strings.TrimSuffix(strings.TrimSpace(raw), "%"))
	if strings.Contains(v, ",") && !strings.Contains(v, ".") {
		v = strings.ReplaceAll(v, ",", ".")
	}
	return strconv.ParseFloat(v, 64)
}

// parseImportRows convierte las filas del archivo (con encabezado) en filas con su estado
// según su propio contenido: número vacío o repetido, coeficiente vacío o inválido, tipo
// desconocido o piso inválido. Las filas totalmente vacías se ignoran.
func parseImportRows(rows [][]string) (int, []domain.ImportRowDTO) {
	if len(rows) == 0 {
		return 0, nil
	}
	cols := detectColumns(rows[0])
	columns := len(rows[0])
	firstRow := map[string]int{}
	out := make([]domain.ImportRowDTO, 0, len(rows)-1)
	for i, row := range rows[1:] {
		if strings.TrimSpace(strings.Join(row, "")) == "" {
			continue
		}
		r := domain.ImportRowDTO{
			Row:    i + 2,
			Number: cell(row, cols.number),
			Block:  cell(row, cols.block),
			Status: domain.ImportRowReady,
		}
		rawCoef := cell(row, cols.coefficient)
		rawType := cell(row, cols.unitType)
		rawFloor := cell(row, cols.floor)

		// Sin tipo en el archivo: UnitType vacío (al crear se usa "apartment"; al actualizar no cambia).
		if rawType != "" {
			if code, ok := unitTypeAliases[normalizeText(rawType)]; ok {
				r.UnitType = code
			} else {
				r.UnitType = rawType
				r.Status, r.Message = domain.ImportRowUnknownType, fmt.Sprintf("Tipo desconocido: %s", rawType)
			}
		}
		if rawFloor != "" {
			if f, err := strconv.Atoi(rawFloor); err == nil {
				r.Floor = &f
			} else if r.Status == domain.ImportRowReady {
				r.Status, r.Message = domain.ImportRowInvalidFloor, "Piso no válido"
			}
		}
		if rawCoef != "" {
			if c, err := parseCoefficient(rawCoef); err == nil && c > 0 {
				r.Coefficient = &c
			} else if r.Status == domain.ImportRowReady {
				r.Status, r.Message = domain.ImportRowInvalidCoefficient, "Coeficiente no válido"
			}
		} else if r.Status == domain.ImportRowReady {
			r.Status, r.Message = domain.ImportRowEmptyCoefficient, "Coeficiente vacío"
		}

		// El número manda sobre los demás errores.
		key := normalizeText(r.Number)
		if r.Number == "" {
			r.Status, r.Message = domain.ImportRowEmptyNumber, "Número vacío"
		} else if first, dup := firstRow[key]; dup {
			r.Status, r.Message, r.DuplicateOf = domain.ImportRowDuplicate, fmt.Sprintf("Número duplicado (fila %d)", first), first
		} else {
			firstRow[key] = r.Row
		}
		out = append(out, r)
	}
	return columns, out
}

// classifyImportRows marca como "exists" las filas válidas cuyo número ya existe y calcula el
// resumen de la vista previa.
func classifyImportRows(columns int, rows []domain.ImportRowDTO, existing []domain.ExistingUnitDTO) *domain.ImportPreviewDTO {
	byNumber := make(map[string]domain.ExistingUnitDTO, len(existing))
	for _, e := range existing {
		byNumber[normalizeText(e.Number)] = e
	}
	preview := &domain.ImportPreviewDTO{Columns: columns, Rows: rows}
	inFile := map[string]bool{}
	for i := range rows {
		r := &rows[i]
		key := normalizeText(r.Number)
		if r.Status == domain.ImportRowReady {
			if _, ok := byNumber[key]; ok {
				r.Status, r.Message = domain.ImportRowExists, "Ya existe"
			}
		}
		switch {
		case r.IsError():
			preview.Errors++
		case r.Status == domain.ImportRowExists:
			preview.Existing++
		default:
			preview.Ready++
		}
		if !r.IsError() && r.Coefficient != nil {
			preview.CoefficientTotal += *r.Coefficient
			inFile[key] = true
		}
	}
	for key, e := range byNumber {
		if !inFile[key] {
			preview.CoefficientTotal += e.Coefficient
		}
	}
	return preview
}
