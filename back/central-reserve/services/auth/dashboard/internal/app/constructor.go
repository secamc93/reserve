package app

import (
	"central_reserve/services/auth/dashboard/internal/domain"
	"central_reserve/shared/log"
	"context"
)

type IDashboardUseCase interface {
	GetDashboardStats(ctx context.Context, businessTypeID *uint, businessID *uint) (*domain.DashboardStats, error)
}

type DashboardUseCase struct {
	repository domain.IDashboardRepository
	log        log.ILogger
}

func New(repository domain.IDashboardRepository, log log.ILogger) IDashboardUseCase {
	return &DashboardUseCase{
		repository: repository,
		log:        log,
	}
}


