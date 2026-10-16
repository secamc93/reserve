package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/resident/internal/app"
	"central_reserve/services/horizontalproperty/resident/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/resident/internal/domain"
)

func TestGetResidentOverview(t *testing.T) {
	newRepo := func(residentBusiness uint, called *bool) *mocks.MockResidentRepository {
		return &mocks.MockResidentRepository{
			GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
				return &domain.ResidentDetailDTO{ID: id, BusinessID: residentBusiness, Name: "Ana"}, nil
			},
			GetResidentOverviewFunc: func(ctx context.Context, businessID, residentID uint, now time.Time) (*domain.ResidentOverviewDTO, error) {
				*called = true
				return &domain.ResidentOverviewDTO{Stats: domain.ResidentOverviewStatsDTO{PackagesPending: 2, VotesCast: 4, VotesTotal: 4}}, nil
			},
		}
	}

	t.Run("residente de la propiedad: devuelve el resumen con listas vacías (no nil)", func(t *testing.T) {
		called := false
		res, err := app.New(newRepo(3, &called), mocks.NewMockLogger()).GetResidentOverview(context.Background(), 3, 5)
		if err != nil || !called {
			t.Fatalf("err=%v called=%v", err, called)
		}
		if res.Stats.PackagesPending != 2 || res.Housemates == nil || res.Activity == nil {
			t.Fatalf("resumen inesperado: %+v", res)
		}
	})

	t.Run("residente de otra propiedad: no encontrado y sin consultar la actividad", func(t *testing.T) {
		called := false
		_, err := app.New(newRepo(9, &called), mocks.NewMockLogger()).GetResidentOverview(context.Background(), 3, 5)
		if !errors.Is(err, domain.ErrResidentNotFound) || called {
			t.Fatalf("esperaba ErrResidentNotFound sin consulta; err=%v called=%v", err, called)
		}
	})

	t.Run("sin business_id", func(t *testing.T) {
		called := false
		if _, err := app.New(newRepo(3, &called), mocks.NewMockLogger()).GetResidentOverview(context.Background(), 0, 5); !errors.Is(err, domain.ErrBusinessIDRequired) {
			t.Fatalf("esperaba ErrBusinessIDRequired, obtuvo %v", err)
		}
	})
}
