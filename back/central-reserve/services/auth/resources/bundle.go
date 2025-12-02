package resources

import (
	"central_reserve/services/auth/resources/internal/app"
	"central_reserve/services/auth/resources/internal/infra/primary/handlers"
	"central_reserve/services/auth/resources/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New inicializa y registra todos los componentes del módulo de recursos
func New(db db.IDatabase, logger log.ILogger, v1Group *gin.RouterGroup) {
	Repository := repository.New(db, logger)
	UseCase := app.New(Repository, logger)
	Handlers := handlers.New(UseCase, logger)
	handlers.RegisterRoutes(v1Group, Handlers, logger)
}
