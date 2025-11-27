package attendance

import (
	"central_reserve/services/horizontalproperty/attendance/internal/app"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func New(db db.IDatabase, logger log.ILogger, router *gin.RouterGroup) {
	repo := repository.New(db, logger)
	useCase := app.NewAttendanceUseCase(repo, logger)
	handler := handlers.NewAttendanceHandler(useCase, logger)
	handler.RegisterRoutes(router)
}
