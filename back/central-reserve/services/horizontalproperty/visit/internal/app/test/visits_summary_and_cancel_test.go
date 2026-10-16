package app_test

import (
	"context"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/visit/internal/app"
	"central_reserve/services/horizontalproperty/visit/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/visit/internal/domain"
)

func newUseCase(repo *mocks.MockVisitRepository) domain.VisitUseCase {
	return app.New(&mocks.MockVisitorRepository{}, repo, &mocks.MockVisitCompanionRepository{},
		&mocks.MockVisitAssetRepository{}, &mocks.MockVisitBlacklistRepository{}, mocks.NewMockLogger())
}

func TestGetVisitsSummary_CuentaElDiaPorEstadoDePorteria(t *testing.T) {
	type call struct {
		codes    []string
		from, to *time.Time
	}
	var calls []call
	repo := &mocks.MockVisitRepository{
		CountVisitsByStatusCodesFunc: func(ctx context.Context, businessID uint, codes []string, from *time.Time, to *time.Time) (int64, error) {
			if businessID != 3 {
				t.Errorf("business_id = %d, se esperaba 3", businessID)
			}
			calls = append(calls, call{codes, from, to})
			switch {
			case codes[0] == "in_progress" && from == nil:
				return 6, nil // dentro ahora (incluye visitas de días anteriores)
			case codes[0] == "in_progress":
				return 4, nil
			case codes[0] == "pending":
				return 9, nil
			case codes[0] == "completed":
				return 12, nil
			default:
				return 1, nil
			}
		},
	}

	day := time.Date(2026, 10, 15, 22, 30, 0, 0, time.FixedZone("COT", -5*3600))
	s, err := newUseCase(repo).GetVisitsSummary(context.Background(), 3, day)
	if err != nil {
		t.Fatal(err)
	}
	if s.Inside != 4 || s.Expected != 9 || s.Left != 12 || s.Cancelled != 1 || s.Total != 26 || s.InsideNow != 6 {
		t.Fatalf("resumen inesperado: %+v", s)
	}

	wantFrom := time.Date(2026, 10, 15, 0, 0, 0, 0, time.UTC)
	for _, c := range calls {
		if c.from == nil {
			continue
		}
		if !c.from.Equal(wantFrom) || !c.to.Equal(wantFrom.Add(24*time.Hour)) {
			t.Errorf("rango = [%v, %v), se esperaba el 15 de octubre completo", c.from, c.to)
		}
	}
	for _, c := range calls {
		if c.codes[0] == "pending" && (len(c.codes) != 2 || c.codes[1] != "authorized") {
			t.Errorf("esperadas = %v, se esperaba pending + authorized", c.codes)
		}
		if c.codes[0] == "cancelled" && len(c.codes) != 3 {
			t.Errorf("canceladas = %v, se esperaba cancelled + rejected + expired", c.codes)
		}
	}
}

func TestListVisits_NormalizaEstadoYBusqueda(t *testing.T) {
	var captured domain.VisitFiltersDTO
	repo := &mocks.MockVisitRepository{
		ListVisitsFunc: func(ctx context.Context, f domain.VisitFiltersDTO) (*domain.PaginatedVisitsDTO, error) {
			captured = f
			return &domain.PaginatedVisitsDTO{}, nil
		},
	}
	uc := newUseCase(repo)
	if _, err := uc.ListVisits(context.Background(), domain.VisitFiltersDTO{State: "INSIDE", Search: " casa 126 "}); err != nil {
		t.Fatal(err)
	}
	if captured.State != "inside" || captured.Search != "casa 126" {
		t.Errorf("filtros = %+v", captured)
	}
	if _, err := uc.ListVisits(context.Background(), domain.VisitFiltersDTO{State: "x"}); err != nil {
		t.Fatal(err)
	}
	if captured.State != "" {
		t.Errorf("un estado desconocido debe ignorarse, llegó %q", captured.State)
	}
}

func cancelRepo(status string, entered, exited bool, changed *string) *mocks.MockVisitRepository {
	now := time.Now()
	return &mocks.MockVisitRepository{
		GetVisitWithRelationsFunc: func(ctx context.Context, id uint) (*domain.Visit, *domain.VisitType, *domain.VisitStatus, error) {
			v := &domain.Visit{ID: id, VisitStatusID: 77}
			if entered {
				v.ActualEntryTime = &now
			}
			if exited {
				v.ActualExitTime = &now
			}
			return v, &domain.VisitType{}, &domain.VisitStatus{ID: 77, Code: status, IsFinal: status == "completed" || status == "cancelled"}, nil
		},
		ChangeVisitStatusFunc: func(ctx context.Context, visitID uint, code string) error {
			*changed = code
			return nil
		},
	}
}

// Regresión: cancelar respondía 200 pero no cambiaba nada (fijaba el id 5 y UpdateVisit no
// actualiza el estado). Ahora cambia el estado por código.
func TestDeleteVisit_CambiaElEstadoACancelledPorCodigo(t *testing.T) {
	var changed string
	if err := newUseCase(cancelRepo("authorized", false, false, &changed)).DeleteVisit(context.Background(), 10); err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if changed != "cancelled" {
		t.Fatalf("estado cambiado a %q, se esperaba cancelled", changed)
	}
}

func TestDeleteVisit_NoCancelaConElVisitanteDentro(t *testing.T) {
	var changed string
	err := newUseCase(cancelRepo("in_progress", true, false, &changed)).DeleteVisit(context.Background(), 10)
	if err != domain.ErrVisitNotInProgress {
		t.Fatalf("error = %v, se esperaba ErrVisitNotInProgress", err)
	}
	if changed != "" {
		t.Fatalf("no debía cambiar el estado, cambió a %q", changed)
	}
}

func TestDeleteVisit_NoCancelaUnaVisitaTerminada(t *testing.T) {
	var changed string
	if err := newUseCase(cancelRepo("completed", true, true, &changed)).DeleteVisit(context.Background(), 10); err == nil {
		t.Fatal("se esperaba error al cancelar una visita completada")
	}
	if changed != "" {
		t.Fatalf("no debía cambiar el estado, cambió a %q", changed)
	}
}
