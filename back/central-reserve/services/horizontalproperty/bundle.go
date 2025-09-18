package horizontalproperty

import (
	"central_reserve/services/horizontalproperty/internal/app/usecasehorizontalproperty"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler"
	"central_reserve/services/horizontalproperty/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New inicializa el servicio de propiedades horizontales con todas sus dependencias
func New(db db.IDatabase, logger log.ILogger, v1Group *gin.RouterGroup) {
	// Crear repositorio consolidado
	repo := repository.New(db, logger)

	// Crear casos de uso
	horizontalPropertyUseCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(
		repo,
		logger,
	)

	// Crear handlers
	horizontalPropertyHandler := horizontalpropertyhandler.NewHorizontalPropertyHandler(
		horizontalPropertyUseCase,
		logger,
	)

	// Registrar rutas
	horizontalPropertyHandler.RegisterRoutes(v1Group)
}
