package handlers

import (
	"central_reserve/services/auth/logs/internal/domain"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

type Ihandlers interface {
	StreamLogsHandler(c *gin.Context)
	RegisterRoutes(router *gin.RouterGroup, handler Ihandlers, logger log.ILogger)
}

type handlers struct {
	usecase domain.ILogsUseCase
	logger  log.ILogger
}

func New(usecase domain.ILogsUseCase, logger log.ILogger) Ihandlers {
	return &handlers{
		usecase: usecase,
		logger:  logger,
	}
}
