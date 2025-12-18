package handlers

import (
	"central_reserve/services/auth/dashboard/internal/app"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

type Ihandlers interface {
	GetDashboardStatsHandler(c *gin.Context)
	RegisterRoutes(router *gin.RouterGroup, handler Ihandlers, logger log.ILogger)
}

type handlers struct {
	usecase app.IDashboardUseCase
	logger  log.ILogger
}

func New(usecase app.IDashboardUseCase, logger log.ILogger) Ihandlers {
	return &handlers{
		usecase: usecase,
		logger:  logger,
	}
}


