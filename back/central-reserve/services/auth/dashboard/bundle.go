package dashboard

import (
	"central_reserve/services/auth/dashboard/internal/app"
	"central_reserve/services/auth/dashboard/internal/infra/primary/handlers"
	"central_reserve/services/auth/dashboard/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func New(db db.IDatabase, logger log.ILogger, v1Group *gin.RouterGroup) {
	dashboardRepo := repository.New(db, logger)
	dashboardUseCase := app.New(dashboardRepo, logger)
	dashboardHandler := handlers.New(dashboardUseCase, logger)

	dashboardHandler.RegisterRoutes(v1Group, dashboardHandler, logger)
}
