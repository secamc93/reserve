package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/visit/internal/app"
	"central_reserve/services/horizontalproperty/visit/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/visit/internal/domain"
)

func TestCreateOrGetVisitorVehicle_NormalizaLaPlaca(t *testing.T) {
	var saved *domain.VisitorVehicle
	visitorRepo := &mocks.MockVisitorRepository{
		UpsertVehicleFunc: func(ctx context.Context, v *domain.VisitorVehicle) (*domain.VisitorVehicle, error) {
			saved = v
			v.ID = 3
			return v, nil
		},
	}
	uc := app.New(visitorRepo, &mocks.MockVisitRepository{}, &mocks.MockVisitCompanionRepository{}, &mocks.MockVisitAssetRepository{}, &mocks.MockVisitBlacklistRepository{}, mocks.NewMockLogger())
	visitorID := uint(55)
	v, err := uc.CreateOrGetVisitorVehicle(context.Background(), domain.VisitorVehicle{BusinessID: 7, VisitorID: &visitorID, Plate: " kjm 842 ", Brand: "Mazda ", Color: "Gris"})
	if err != nil {
		t.Fatal(err)
	}
	if v.ID != 3 || saved.Plate != "KJM842" || saved.Brand != "Mazda" || !saved.IsActive || *saved.VisitorID != 55 {
		t.Fatalf("vehículo guardado: %+v", saved)
	}
}

func TestCreateOrGetVisitorVehicle_SinNegocioOPlacaFalla(t *testing.T) {
	uc := newUseCase(&mocks.MockVisitRepository{})
	if _, err := uc.CreateOrGetVisitorVehicle(context.Background(), domain.VisitorVehicle{BusinessID: 0, Plate: "ABC123"}); !errors.Is(err, app.ErrVehicleInvalid) {
		t.Errorf("sin negocio: err = %v", err)
	}
	if _, err := uc.CreateOrGetVisitorVehicle(context.Background(), domain.VisitorVehicle{BusinessID: 7, Plate: "  "}); !errors.Is(err, app.ErrVehicleInvalid) {
		t.Errorf("sin placa: err = %v", err)
	}
}

func TestGetVisitsSummary_IncluyeLosDatosDeLasTarjetas(t *testing.T) {
	next := time.Date(2026, 10, 15, 11, 0, 0, 0, time.UTC)
	avg := 72
	repo := &mocks.MockVisitRepository{
		GetVisitsDayExtrasFunc: func(ctx context.Context, businessID uint, from, to time.Time) (*domain.VisitsDayExtras, error) {
			if !to.Equal(from.Add(24 * time.Hour)) {
				t.Errorf("rango [%v, %v) no es un día", from, to)
			}
			return &domain.VisitsDayExtras{Exceeded: 1, NextExpectedAt: &next, NextUnitNumber: "126", NextUnitBlock: "Casa", AvgStayMinutes: &avg}, nil
		},
	}
	s, err := newUseCase(repo).GetVisitsSummary(context.Background(), 3, next)
	if err != nil {
		t.Fatal(err)
	}
	if s.Exceeded != 1 || s.NextUnitBlock != "Casa" || *s.AvgStayMinutes != 72 || !s.NextExpectedAt.Equal(next) {
		t.Fatalf("resumen: %+v", s)
	}
}
