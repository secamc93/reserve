package app

import (
	"central_reserve/services/horizontalproperty/dashboard/internal/domain"
	"central_reserve/shared/log"
)

type DashboardUseCase struct {
	repo   domain.DashboardRepository
	logger log.ILogger
}

func New(repo domain.DashboardRepository, logger log.ILogger) *DashboardUseCase {
	contextualLogger := logger.WithModule("dashboard")
	return &DashboardUseCase{
		repo:   repo,
		logger: contextualLogger,
	}
}
