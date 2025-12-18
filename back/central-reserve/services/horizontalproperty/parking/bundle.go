package parking

import (
	"central_reserve/services/horizontalproperty/parking/internal/app"
	handler "central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/parking/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New inicializa el módulo de gestión de parqueaderos
func New(db db.IDatabase, logger log.ILogger, v1Group *gin.RouterGroup) {
	serviceLogger := logger.WithService("Gestión de Parqueaderos")

	// Crear repositorios
	parkingZoneRepo := repository.NewParkingZoneRepository(db, serviceLogger)
	parkingSlotRepo := repository.NewParkingSlotRepository(db, serviceLogger)
	parkingAssignmentRepo := repository.NewParkingAssignmentRepository(db, serviceLogger)
	parkingReservationRepo := repository.NewParkingReservationRepository(db, serviceLogger)
	parkingOccupancyRepo := repository.NewParkingOccupancyRepository(db, serviceLogger)

	// Crear caso de uso
	useCase := app.New(
		parkingZoneRepo,
		parkingSlotRepo,
		parkingAssignmentRepo,
		parkingReservationRepo,
		parkingOccupancyRepo,
		serviceLogger,
	)

	// Crear handler
	handler := handler.New(useCase, serviceLogger)

	// Registrar rutas
	handler.RegisterRoutes(v1Group)
}
