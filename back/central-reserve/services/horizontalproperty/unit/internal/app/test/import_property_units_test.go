package app_test

import (
	"context"
	"errors"
	"path/filepath"
	"testing"

	"central_reserve/services/horizontalproperty/unit/internal/app"
	"central_reserve/services/horizontalproperty/unit/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/unit/internal/domain"

	"github.com/xuri/excelize/v2"
)

// writeExcel crea un .xlsx temporal con las filas dadas (la primera es el encabezado).
func writeExcel(t *testing.T, rows [][]string) string {
	t.Helper()
	f := excelize.NewFile()
	sheet := f.GetSheetName(0)
	for i, row := range rows {
		for j, v := range row {
			cellName, _ := excelize.CoordinatesToCellName(j+1, i+1)
			if err := f.SetCellStr(sheet, cellName, v); err != nil {
				t.Fatal(err)
			}
		}
	}
	path := filepath.Join(t.TempDir(), "unidades.xlsx")
	if err := f.SaveAs(path); err != nil {
		t.Fatal(err)
	}
	return path
}

var tayazalFile = [][]string{
	{"Número", "Torre", "Piso", "Tipo", "Coeficiente"},
	{"126", "Casa", "", "Casa", "0,503"},
	{"127", "Casa", "", "Casa", "0.498"},
	{"200", "Casa", "2", "Castillo", "0,5"},
	{"201", "Casa", "", "Casa", ""},
	{"126", "Casa", "", "Casa", "0,4"},
	{"", "Local", "", "Local", "0,1"},
	{"1024", "Local", "", "Local comercial", "0,61"},
}

func statusByRow(p *domain.ImportPreviewDTO) map[int]string {
	out := map[int]string{}
	for _, r := range p.Rows {
		out[r.Row] = r.Status
	}
	return out
}

func TestPreviewPropertyUnitsImport(t *testing.T) {
	created := 0
	repo := &mocks.MockPropertyUnitRepository{
		ListExistingUnitsFunc: func(ctx context.Context, businessID uint) ([]domain.ExistingUnitDTO, error) {
			return []domain.ExistingUnitDTO{{ID: 9, Number: "127", Coefficient: 0.49}, {ID: 10, Number: "300", Coefficient: 98}}, nil
		},
		CreatePropertyUnitFunc: func(ctx context.Context, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
			created++
			return unit, nil
		},
	}
	uc := app.New(repo, mocks.NewMockLogger())
	p, err := uc.PreviewPropertyUnitsImport(context.Background(), 1, writeExcel(t, tayazalFile))
	if err != nil {
		t.Fatalf("PreviewPropertyUnitsImport: %v", err)
	}
	got := statusByRow(p)
	want := map[int]string{
		2: domain.ImportRowReady, 3: domain.ImportRowExists, 4: domain.ImportRowUnknownType,
		5: domain.ImportRowEmptyCoefficient, 6: domain.ImportRowDuplicate, 7: domain.ImportRowEmptyNumber, 8: domain.ImportRowReady,
	}
	for row, status := range want {
		if got[row] != status {
			t.Errorf("fila %d: esperaba %s, obtuvo %s", row, status, got[row])
		}
	}
	if p.Ready != 2 || p.Existing != 1 || p.Errors != 4 || p.Columns != 5 {
		t.Fatalf("resumen inesperado: ready=%d existing=%d errors=%d columns=%d", p.Ready, p.Existing, p.Errors, p.Columns)
	}
	// 0,503 + 0,498 + 0,61 (válidas del archivo) + 98 (la 300, que no está en el archivo)
	if diff := p.CoefficientTotal - 99.611; diff > 1e-9 || diff < -1e-9 {
		t.Fatalf("coeficiente total: esperaba 99,611, obtuvo %v", p.CoefficientTotal)
	}
	for _, r := range p.Rows {
		if r.Row == 6 && r.DuplicateOf != 2 {
			t.Fatalf("la fila 6 duplica la 2, obtuvo %d", r.DuplicateOf)
		}
		if r.Row == 8 && r.UnitType != "commercial" {
			t.Fatalf("'Local comercial' debe mapear a commercial, obtuvo %s", r.UnitType)
		}
	}
	if created != 0 {
		t.Fatal("la vista previa no debe crear unidades")
	}
}

func TestPreviewPropertyUnitsImport_FormatoClasico(t *testing.T) {
	repo := &mocks.MockPropertyUnitRepository{}
	p, err := app.New(repo, mocks.NewMockLogger()).PreviewPropertyUnitsImport(context.Background(), 1,
		writeExcel(t, [][]string{{"Unidad residencial", "Participación %"}, {"101", "0.5"}}))
	if err != nil {
		t.Fatal(err)
	}
	if len(p.Rows) != 1 || p.Rows[0].Number != "101" || p.Rows[0].Coefficient == nil || *p.Rows[0].Coefficient != 0.5 {
		t.Fatalf("columna 1 = número y 2 = coeficiente; obtuvo %+v", p.Rows)
	}
}

func TestPreviewPropertyUnitsImport_ArchivoInvalido(t *testing.T) {
	_, err := app.New(&mocks.MockPropertyUnitRepository{}, mocks.NewMockLogger()).
		PreviewPropertyUnitsImport(context.Background(), 1, writeExcel(t, [][]string{{"Número", "Coeficiente"}}))
	if !errors.Is(err, domain.ErrInvalidImportFile) {
		t.Fatalf("esperaba ErrInvalidImportFile, obtuvo %v", err)
	}
	if _, err := app.New(&mocks.MockPropertyUnitRepository{}, mocks.NewMockLogger()).PreviewPropertyUnitsImport(context.Background(), 0, "x"); !errors.Is(err, domain.ErrBusinessIDRequired) {
		t.Fatalf("sin business_id esperaba ErrBusinessIDRequired, obtuvo %v", err)
	}
}

func TestImportPropertyUnitsFromExcel_ActualizarExistentes(t *testing.T) {
	newRepo := func(created *[]string, updated *[]uint) *mocks.MockPropertyUnitRepository {
		return &mocks.MockPropertyUnitRepository{
			ListExistingUnitsFunc: func(ctx context.Context, businessID uint) ([]domain.ExistingUnitDTO, error) {
				return []domain.ExistingUnitDTO{{ID: 9, Number: "127", Coefficient: 0.49}}, nil
			},
			CreatePropertyUnitFunc: func(ctx context.Context, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
				*created = append(*created, unit.Number+"|"+unit.Block+"|"+unit.UnitType)
				return unit, nil
			},
			GetPropertyUnitByIDFunc: func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
				return &domain.PropertyUnit{ID: id, BusinessID: 1, Number: "127", UnitType: "house", IsActive: true}, nil
			},
			UpdatePropertyUnitFunc: func(ctx context.Context, id uint, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
				*updated = append(*updated, id)
				if unit.ParticipationCoefficient == nil || *unit.ParticipationCoefficient != 0.498 {
					t.Errorf("debía actualizar el coeficiente a 0,498: %+v", unit.ParticipationCoefficient)
				}
				return unit, nil
			},
		}
	}
	path := writeExcel(t, tayazalFile)

	t.Run("sin actualizar: las existentes se omiten", func(t *testing.T) {
		var created []string
		var updated []uint
		res, err := app.New(newRepo(&created, &updated), mocks.NewMockLogger()).ImportPropertyUnitsFromExcel(context.Background(), 1, path, domain.ImportOptions{})
		if err != nil {
			t.Fatal(err)
		}
		if res.Created != 2 || res.Updated != 0 || res.Skipped != 5 || len(updated) != 0 {
			t.Fatalf("resultado inesperado: %+v updated=%v", res, updated)
		}
		if created[0] != "126|Casa|house" || created[1] != "1024|Local|commercial" {
			t.Fatalf("creadas inesperadas: %v", created)
		}
	})

	t.Run("actualizando: la existente se actualiza", func(t *testing.T) {
		var created []string
		var updated []uint
		res, err := app.New(newRepo(&created, &updated), mocks.NewMockLogger()).ImportPropertyUnitsFromExcel(context.Background(), 1, path, domain.ImportOptions{UpdateExisting: true})
		if err != nil {
			t.Fatal(err)
		}
		if res.Created != 2 || res.Updated != 1 || res.Skipped != 4 || len(updated) != 1 || updated[0] != 9 {
			t.Fatalf("resultado inesperado: %+v updated=%v", res, updated)
		}
	})
}
