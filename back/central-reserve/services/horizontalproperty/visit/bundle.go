package visit

import (
	"central_reserve/services/horizontalproperty/visit/internal/app"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/visit/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New initializes the visit module
func New(db db.IDatabase, logger log.ILogger, router *gin.RouterGroup) {
	// Repositories
	visitorRepo := repository.NewVisitorRepository(db, logger)
	visitRepo := repository.NewVisitRepository(db, logger)
	companionRepo := repository.NewVisitCompanionRepository(db, logger)
	assetRepo := repository.NewVisitAssetRepository(db, logger)
	blacklistRepo := repository.NewVisitBlacklistRepository(db, logger)

	// Use Case
	useCase := app.New(visitorRepo, visitRepo, companionRepo, assetRepo, blacklistRepo, logger)

	// Handler
	handler := handlers.New(useCase, logger)

	// Register Routes
	handler.RegisterRoutes(router)
}
