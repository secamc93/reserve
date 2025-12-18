package handlers

import (
	"central_reserve/services/horizontalproperty/dashboard/internal/domain"
	"central_reserve/shared/log"
)

type DashboardHandler struct {
	dashboardUseCase domain.DashboardUseCase
	logger           log.ILogger
}

func New(dashboardUseCase domain.DashboardUseCase, logger log.ILogger) *DashboardHandler {
	contextualLogger := logger.WithModule("dashboard")
	return &DashboardHandler{
		dashboardUseCase: dashboardUseCase,
		logger:           contextualLogger,
	}
}


