package horizontalpropertiy

import (
	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/app/usecasehorizontalproperty"
	handler "central_reserve/services/horizontalproperty/horizontalpropertiy/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"central_reserve/shared/storage"

	"github.com/gin-gonic/gin"
)

// New inicializa el módulo de propiedades horizontales
func New(db db.IDatabase, logger log.ILogger, s3 storage.IS3Service, envConfig env.IConfig, v1Group *gin.RouterGroup) {
	serviceLogger := logger.WithService("Propiedades horizontales")

	// Crear repositorio
	repo := repository.New(db, serviceLogger)

	// Crear caso de uso
	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(
		repo,
		serviceLogger,
		s3,
		envConfig,
	)

	// Crear handler
	handler := handler.NewHorizontalPropertyHandler(
		useCase,
		serviceLogger,
	)

	// Registrar rutas
	handler.RegisterRoutes(v1Group)
}
