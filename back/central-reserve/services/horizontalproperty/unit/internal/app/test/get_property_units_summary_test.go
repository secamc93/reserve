package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/unit/internal/app"
	"central_reserve/services/horizontalproperty/unit/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/unit/internal/domain"
)

func TestGetPropertyUnitsSummary(t *testing.T) {
	t.Run("sin business_id no consulta y devuelve ErrBusinessIDRequired", func(t *testing.T) {
		called := false
		repo := &mocks.MockPropertyUnitRepository{
			GetPropertyUnitsSummaryFunc: func(ctx context.Context, businessID uint) (*domain.PropertyUnitsSummaryDTO, error) {
				called = true
				return nil, nil
			},
		}
		uc := app.New(repo, mocks.NewMockLogger())
		_, err := uc.GetPropertyUnitsSummary(context.Background(), 0)
		if !errors.Is(err, domain.ErrBusinessIDRequired) {
			t.Fatalf("esperaba ErrBusinessIDRequired, obtuvo %v", err)
		}
		if called {
			t.Fatal("no debía consultar el repositorio sin business_id")
		}
	})

	t.Run("consulta la propiedad pedida y devuelve los bloques", func(t *testing.T) {
		var got uint
		repo := &mocks.MockPropertyUnitRepository{
			GetPropertyUnitsSummaryFunc: func(ctx context.Context, businessID uint) (*domain.PropertyUnitsSummaryDTO, error) {
				got = businessID
				return &domain.PropertyUnitsSummaryDTO{
					Total: 168, Active: 168, CoefficientSum: 84.669,
					Blocks: []domain.PropertyUnitBlockSummaryDTO{
						{Block: "Casa", Total: 156, Active: 156, CoefficientSum: 78.568},
						{Block: "Dúplex", Total: 12, Active: 12, CoefficientSum: 6.101},
					},
				}, nil
			},
		}
		uc := app.New(repo, mocks.NewMockLogger())
		res, err := uc.GetPropertyUnitsSummary(context.Background(), 7)
		if err != nil {
			t.Fatalf("error inesperado: %v", err)
		}
		if got != 7 {
			t.Fatalf("esperaba business_id 7, obtuvo %d", got)
		}
		if len(res.Blocks) != 2 || res.Blocks[1].Block != "Dúplex" || res.Total != 168 {
			t.Fatalf("resumen inesperado: %+v", res)
		}
	})

	t.Run("sin bloques devuelve lista vacía (no nil)", func(t *testing.T) {
		repo := &mocks.MockPropertyUnitRepository{
			GetPropertyUnitsSummaryFunc: func(ctx context.Context, businessID uint) (*domain.PropertyUnitsSummaryDTO, error) {
				return &domain.PropertyUnitsSummaryDTO{}, nil
			},
		}
		res, err := app.New(repo, mocks.NewMockLogger()).GetPropertyUnitsSummary(context.Background(), 3)
		if err != nil || res.Blocks == nil {
			t.Fatalf("esperaba bloques vacíos sin error, obtuvo %+v, %v", res, err)
		}
	})

	t.Run("propaga el error del repositorio", func(t *testing.T) {
		repo := &mocks.MockPropertyUnitRepository{
			GetPropertyUnitsSummaryFunc: func(ctx context.Context, businessID uint) (*domain.PropertyUnitsSummaryDTO, error) {
				return nil, errors.New("db caída")
			},
		}
		if _, err := app.New(repo, mocks.NewMockLogger()).GetPropertyUnitsSummary(context.Background(), 3); err == nil {
			t.Fatal("esperaba error")
		}
	})
}
