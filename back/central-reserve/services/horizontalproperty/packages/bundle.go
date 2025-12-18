package packages

import (
	"central_reserve/services/horizontalproperty/packages/internal/app"
	handler "central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/packages/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New inicializa el módulo de paquetería
func New(db db.IDatabase, logger log.ILogger, router *gin.RouterGroup) {
	serviceLogger := logger.WithService("Paquetería")

	// Crear repositorio
	packageRepo := repository.NewPackageRepository(db, serviceLogger)

	// Crear caso de uso
	useCase := app.New(packageRepo, serviceLogger)

	// Crear handler
	handler := handler.New(useCase, serviceLogger)

	// Registrar rutas
	handler.RegisterRoutes(router)
}
