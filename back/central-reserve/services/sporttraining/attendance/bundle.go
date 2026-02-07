package attendance

import (
	"central_reserve/services/sporttraining/attendance/internal/app"
	handlers "central_reserve/services/sporttraining/attendance/internal/infra/primary/handlers"
	"central_reserve/services/sporttraining/attendance/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New inicializa el módulo de asistencia
func New(db db.IDatabase, logger log.ILogger, router *gin.RouterGroup) {
	repo := repository.New(db, logger)
	useCase := app.New(repo, logger)
	handler := handlers.New(useCase, logger)
	handler.RegisterRoutes(router)
}
