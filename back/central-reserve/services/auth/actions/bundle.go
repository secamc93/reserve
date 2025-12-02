package actions

import (
	"central_reserve/services/auth/actions/internal/app"
	"central_reserve/services/auth/actions/internal/infra/primary/handlers"
	"central_reserve/services/auth/actions/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New inicializa y registra todos los componentes del módulo de actions
func New(database db.IDatabase, logger log.ILogger, v1Group *gin.RouterGroup) {
	// Repositorio
	repo := repository.New(database, logger)

	// Casos de uso
	useCase := app.New(repo, logger)

	// Handlers HTTP
	handlers := handlers.New(useCase, logger)

	// Rutas /actions
	handlers.RegisterRoutes(v1Group, handlers, logger)
}
