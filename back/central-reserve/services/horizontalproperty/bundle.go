package horizontalproperty

import (
	"central_reserve/services/horizontalproperty/attendance"
	"central_reserve/services/horizontalproperty/commonarea"
	"central_reserve/services/horizontalproperty/dashboard"
	"central_reserve/services/horizontalproperty/horizontalpropertiy"
	"central_reserve/services/horizontalproperty/packages"
	"central_reserve/services/horizontalproperty/parking"
	"central_reserve/services/horizontalproperty/resident"
	"central_reserve/services/horizontalproperty/unit"
	"central_reserve/services/horizontalproperty/visit"
	"central_reserve/services/horizontalproperty/vote"
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"central_reserve/shared/storage"

	"github.com/gin-gonic/gin"
)

// New inicializa el servicio de propiedades horizontales con todas sus dependencias
func New(db db.IDatabase, logger log.ILogger, s3 storage.IS3Service, envConfig env.IConfig, v1Group *gin.RouterGroup) {
	// Crear logger contextual para todo el servicio horizontalproperty
	serviceLogger := logger.WithService("Propiedades horizontales")

	// Obtener JWT secret del env
	jwtSecret := envConfig.Get("JWT_SECRET")

	// Inicializar módulo de propiedades horizontales (NUEVO - autónomo)
	horizontalpropertiy.New(db, logger, s3, envConfig, v1Group)

	// Initialize Unit Module
	unit.New(db, serviceLogger, v1Group)

	// Initialize Vote Module (completamente autocontenido - no depende de otros módulos)
	vote.New(db, jwtSecret, serviceLogger, v1Group)

	// Initialize Resident Module
	resident.New(db, serviceLogger, v1Group)

	// Initialize Attendance Module
	attendance.New(db, serviceLogger, v1Group)

	// Initialize Dashboard Module
	dashboard.New(db, envConfig, serviceLogger, v1Group)

	// Initialize Visit Module
	visit.New(db, serviceLogger, v1Group)

	// Initialize Common Areas and Reservations Module
	commonarea.New(db, serviceLogger, v1Group)

	// Initialize Parking Module
	parking.New(db, serviceLogger, v1Group)

	// Initialize Package Module
	packages.New(db, serviceLogger, v1Group)
}
