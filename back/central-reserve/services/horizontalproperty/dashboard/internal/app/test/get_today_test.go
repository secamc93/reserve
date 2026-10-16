package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/dashboard/internal/app"
	"central_reserve/services/horizontalproperty/dashboard/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/dashboard/internal/domain"
)

func TestGetToday_PideLaPropiedad(t *testing.T) {
	called := false
	repo := &mocks.DashboardRepositoryMock{GetTodaySummaryFunc: func(ctx context.Context, b uint, d time.Time) (*domain.TodaySummary, error) {
		called = true
		return &domain.TodaySummary{}, nil
	}}
	_, err := app.New(repo, mocks.NewLoggerMock()).GetToday(context.Background(), 0, time.Now())
	if !errors.Is(err, domain.ErrBusinessRequired) || called {
		t.Fatalf("sin propiedad debe fallar sin consultar: err=%v called=%v", err, called)
	}
}

func TestGetToday_DevuelveElResumenDeLaPropiedad(t *testing.T) {
	day := time.Date(2026, 10, 15, 0, 0, 0, 0, time.UTC)
	var gotBusiness uint
	var gotDay time.Time
	repo := &mocks.DashboardRepositoryMock{GetTodaySummaryFunc: func(ctx context.Context, b uint, d time.Time) (*domain.TodaySummary, error) {
		gotBusiness, gotDay = b, d
		return &domain.TodaySummary{VisitsInsideCount: 7, PackagesPending: 12}, nil
	}}
	res, err := app.New(repo, mocks.NewLoggerMock()).GetToday(context.Background(), 1, day)
	if err != nil || res.VisitsInsideCount != 7 || res.PackagesPending != 12 || gotBusiness != 1 || !gotDay.Equal(day) {
		t.Fatalf("resumen inesperado: %+v (%v) business=%d day=%v", res, err, gotBusiness, gotDay)
	}
}
