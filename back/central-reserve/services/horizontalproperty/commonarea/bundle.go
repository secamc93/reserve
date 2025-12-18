package commonarea

import (
	"central_reserve/services/horizontalproperty/commonarea/internal/app"
	handler "central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New inicializa el módulo de zonas comunes y reservas
func New(db db.IDatabase, logger log.ILogger, v1Group *gin.RouterGroup) {
	serviceLogger := logger.WithService("Zonas Comunes y Reservas")

	// Crear repositorios
	commonAreaRepo := repository.NewCommonAreaRepository(db, serviceLogger)
	scheduleRepo := repository.NewCommonAreaScheduleRepository(db, serviceLogger)
	restrictionRepo := repository.NewCommonAreaRestrictionRepository(db, serviceLogger)
	reservationRepo := repository.NewCommonAreaReservationRepository(db, serviceLogger)

	// Crear caso de uso
	useCase := app.New(
		commonAreaRepo,
		scheduleRepo,
		restrictionRepo,
		reservationRepo,
		serviceLogger,
	)

	// Crear handler
	handler := handler.New(useCase, serviceLogger)

	// Registrar rutas
	handler.RegisterRoutes(v1Group)
}
