package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/packages/internal/app"
	"central_reserve/services/horizontalproperty/packages/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/packages/internal/domain"
)

type countCall struct {
	businessID     uint
	codes          []string
	receivedBefore *time.Time
	deliveredSince *time.Time
}

func TestGetPackagesSummary_CuentaPorGrupoConLimitesDeTiempo(t *testing.T) {
	// 15 de octubre de 2026, 10:00 hora de Colombia (15:00 UTC)
	now := time.Date(2026, 10, 15, 15, 0, 0, 0, time.UTC)
	var calls []countCall

	repo := &mocks.PackageRepositoryMock{
		CountPackagesByStatusCodesFunc: func(ctx context.Context, businessID uint, codes []string, receivedBefore *time.Time, deliveredSince *time.Time) (int64, error) {
			calls = append(calls, countCall{businessID, codes, receivedBefore, deliveredSince})
			switch {
			case codes[0] == "received" && receivedBefore == nil:
				return 12, nil
			case codes[0] == "received":
				return 3, nil
			case codes[0] == "delivered" && deliveredSince == nil:
				return 40, nil
			case codes[0] == "delivered":
				return 8, nil
			default:
				return 2, nil
			}
		},
	}

	uc := app.New(repo, mocks.NewLoggerMock())
	summary, err := uc.GetPackagesSummary(context.Background(), 7, now)
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}

	if summary.Pending != 12 || summary.PendingOverdue != 3 || summary.Delivered != 40 || summary.DeliveredToday != 8 || summary.Closed != 2 {
		t.Fatalf("conteos inesperados: %+v", summary)
	}
	if summary.Total != 54 {
		t.Errorf("total = %d, se esperaba 54 (por entregar + entregados + devueltos)", summary.Total)
	}

	for _, c := range calls {
		if c.businessID != 7 {
			t.Errorf("se contó con business_id %d, se esperaba 7", c.businessID)
		}
		if c.receivedBefore != nil {
			want := now.Add(-72 * time.Hour)
			if !c.receivedBefore.Equal(want) {
				t.Errorf("límite de atraso = %v, se esperaba %v (3 días)", c.receivedBefore, want)
			}
			if len(c.codes) != 3 {
				t.Errorf("los atrasados deben contar solo estados por entregar, llegó %v", c.codes)
			}
		}
		if c.deliveredSince != nil {
			want := time.Date(2026, 10, 15, 5, 0, 0, 0, time.UTC) // 00:00 en Colombia
			if !c.deliveredSince.Equal(want) {
				t.Errorf("inicio del día = %v, se esperaba %v", c.deliveredSince.UTC(), want)
			}
		}
	}
}

func TestGetPackagesSummary_PropagaErrorDelRepositorio(t *testing.T) {
	repo := &mocks.PackageRepositoryMock{
		CountPackagesByStatusCodesFunc: func(ctx context.Context, businessID uint, codes []string, receivedBefore *time.Time, deliveredSince *time.Time) (int64, error) {
			return 0, errors.New("bd caída")
		},
	}
	uc := app.New(repo, mocks.NewLoggerMock())
	if _, err := uc.GetPackagesSummary(context.Background(), 1, time.Now()); err == nil {
		t.Fatal("se esperaba error")
	}
}

func TestListPackages_NormalizaGrupoYBusqueda(t *testing.T) {
	var captured domain.PackageFiltersDTO
	repo := &mocks.PackageRepositoryMock{
		ListPackagesFunc: func(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
			captured = filters
			return &domain.PaginatedPackagesDTO{}, nil
		},
	}
	uc := app.New(repo, mocks.NewLoggerMock())

	if _, err := uc.ListPackages(context.Background(), domain.PackageFiltersDTO{StatusGroup: " Pending ", Search: "  126 "}); err != nil {
		t.Fatal(err)
	}
	if captured.StatusGroup != "pending" || captured.Search != "126" {
		t.Errorf("filtros = %+v, se esperaba grupo 'pending' y búsqueda '126'", captured)
	}

	if _, err := uc.ListPackages(context.Background(), domain.PackageFiltersDTO{StatusGroup: "inventado"}); err != nil {
		t.Fatal(err)
	}
	if captured.StatusGroup != "" {
		t.Errorf("un grupo desconocido debe ignorarse (todos), llegó %q", captured.StatusGroup)
	}
}
