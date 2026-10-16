package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/resident/internal/app"
	"central_reserve/services/horizontalproperty/resident/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/resident/internal/domain"
)

func TestGetResidentsSummary(t *testing.T) {
	t.Run("sin business_id devuelve ErrBusinessIDRequired sin consultar", func(t *testing.T) {
		called := false
		repo := &mocks.MockResidentRepository{
			GetResidentsSummaryFunc: func(ctx context.Context, businessID uint) (*domain.ResidentsSummaryDTO, error) {
				called = true
				return nil, nil
			},
		}
		_, err := app.New(repo, mocks.NewMockLogger()).GetResidentsSummary(context.Background(), 0)
		if !errors.Is(err, domain.ErrBusinessIDRequired) || called {
			t.Fatalf("esperaba ErrBusinessIDRequired sin consulta; err=%v called=%v", err, called)
		}
	})

	t.Run("devuelve el conteo por tipo de la propiedad pedida", func(t *testing.T) {
		var got uint
		repo := &mocks.MockResidentRepository{
			GetResidentsSummaryFunc: func(ctx context.Context, businessID uint) (*domain.ResidentsSummaryDTO, error) {
				got = businessID
				return &domain.ResidentsSummaryDTO{Total: 3, Active: 2, Inactive: 1, Main: 2, Types: []domain.ResidentTypeCountDTO{
					{ResidentTypeID: 5, Name: "Propietario", Code: "owner", Total: 2},
					{ResidentTypeID: 6, Name: "Arrendatario", Code: "tenant", Total: 1},
				}}, nil
			},
		}
		res, err := app.New(repo, mocks.NewMockLogger()).GetResidentsSummary(context.Background(), 4)
		if err != nil || got != 4 {
			t.Fatalf("err=%v business=%d", err, got)
		}
		if res.Total != 3 || len(res.Types) != 2 || res.Types[0].ResidentTypeID != 5 {
			t.Fatalf("resumen inesperado: %+v", res)
		}
	})

	t.Run("sin tipos devuelve lista vacía", func(t *testing.T) {
		repo := &mocks.MockResidentRepository{
			GetResidentsSummaryFunc: func(ctx context.Context, businessID uint) (*domain.ResidentsSummaryDTO, error) {
				return &domain.ResidentsSummaryDTO{}, nil
			},
		}
		res, err := app.New(repo, mocks.NewMockLogger()).GetResidentsSummary(context.Background(), 4)
		if err != nil || res.Types == nil {
			t.Fatalf("esperaba tipos vacíos; res=%+v err=%v", res, err)
		}
	})
}
