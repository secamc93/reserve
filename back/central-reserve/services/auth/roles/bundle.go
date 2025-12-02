package roles

import (
	"central_reserve/services/auth/roles/internal/app"
	"central_reserve/services/auth/roles/internal/infra/primary/handlers"
	"central_reserve/services/auth/roles/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New inicializa y registra los componentes del módulo de roles
func New(db db.IDatabase, logger log.ILogger, v1Group *gin.RouterGroup) {
	// Inicializar el repositorio de roles
	roleRepository := repository.New(db, logger)

	// Inicializar el caso de uso de roles
	roleUseCase := app.New(roleRepository, logger)

	// Inicializar los handlers de roles
	roleHandlers := handlers.New(roleUseCase, logger)

	// Registrar las rutas de roles
	roleHandlers.RegisterRoutes(v1Group, roleHandlers, logger)

}
