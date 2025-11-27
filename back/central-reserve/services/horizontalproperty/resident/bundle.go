package resident

import (
	"central_reserve/services/horizontalproperty/resident/internal/app"
	"central_reserve/services/horizontalproperty/resident/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/resident/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New initializes the resident module
func New(db db.IDatabase, logger log.ILogger, router *gin.RouterGroup) {
	// Repository
	repo := repository.New(db, logger)

	// Use Case
	useCase := app.New(repo, logger)

	// Handler
	handler := handlers.New(useCase, logger)

	// Register Routes
	handler.RegisterRoutes(router)
}
