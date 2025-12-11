package logs

import (
	"central_reserve/services/auth/logs/internal/app"
	"central_reserve/services/auth/logs/internal/infra/primary/handlers"
	"central_reserve/services/auth/logs/internal/infra/secondary/repository"
	"central_reserve/shared/env"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func New(env env.IConfig, logger log.ILogger, v1Group *gin.RouterGroup) {
	logsRepo := repository.New(env, logger)
	logsUseCase := app.New(logsRepo, logger)
	logsHandler := handlers.New(logsUseCase, logger)

	logsHandler.RegisterRoutes(v1Group, logsHandler, logger)
}
