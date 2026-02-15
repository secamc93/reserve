package sporttraining

import (
	"central_reserve/services/sporttraining/attendance"
	"central_reserve/services/sporttraining/booking"
	"central_reserve/services/sporttraining/catalog"
	"central_reserve/services/sporttraining/coach"
	"central_reserve/services/sporttraining/guardian"
	"central_reserve/services/sporttraining/player"
	"central_reserve/services/sporttraining/session"
	"central_reserve/services/sporttraining/traininggroup"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New inicializa el servicio de sport training con todos sus módulos
func New(db db.IDatabase, logger log.ILogger, v1Group *gin.RouterGroup) {
	serviceLogger := logger.WithService("Sport Training")

	// Catálogos (datos maestros - solo lectura)
	catalog.New(db, serviceLogger, v1Group)

	// Jugadores
	player.New(db, serviceLogger, v1Group)

	// Tutores/Padres
	guardian.New(db, serviceLogger, v1Group)

	// Entrenadores
	coach.New(db, serviceLogger, v1Group)

	// Grupos de entrenamiento
	traininggroup.New(db, serviceLogger, v1Group)

	// Sesiones de entrenamiento
	session.New(db, serviceLogger, v1Group)

	// Reservas
	booking.New(db, serviceLogger, v1Group)

	// Asistencia
	attendance.New(db, serviceLogger, v1Group)
}
