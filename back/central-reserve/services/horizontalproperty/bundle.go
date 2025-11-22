package horizontalproperty

import (
	"central_reserve/services/horizontalproperty/horizontalpropertiy"
	"central_reserve/services/horizontalproperty/internal/app/usecaseattendance"
	"central_reserve/services/horizontalproperty/internal/app/usecasepropertyunit"
	"central_reserve/services/horizontalproperty/internal/app/usecaseresident"
	"central_reserve/services/horizontalproperty/internal/app/usecasevote"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote"
	"central_reserve/services/horizontalproperty/internal/infra/secondary/repository"
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

	// Inicializar módulo de propiedades horizontales (NUEVO - autónomo)
	horizontalpropertiy.New(db, logger, s3, envConfig, v1Group)

	// Crear repositorio consolidado (OLD - para otros dominios)
	// Crear repositorio consolidado (OLD - para otros dominios)
	repoConcrete := repository.New(db, serviceLogger)

	// Voting use case (necesita acceso a voting y resident repos)
	votingUseCase := usecasevote.NewVotingUseCase(repoConcrete, repoConcrete, serviceLogger)

	// Property Unit use case
	propertyUnitUseCase := usecasepropertyunit.New(repoConcrete, serviceLogger)

	// Resident use case
	residentUseCase := usecaseresident.New(repoConcrete, serviceLogger)

	// Attendance use case
	attendanceUseCase := usecaseattendance.NewAttendanceUseCase(repoConcrete, serviceLogger)

	// Crear cache de votaciones para SSE en tiempo real
	votingCache := domain.NewVotingCache()

	// Obtener JWT secret del env
	jwtSecret := envConfig.Get("JWT_SECRET")

	votingHandler := handlervote.NewVotingHandler(
		votingUseCase,
		repoConcrete,
		propertyUnitUseCase,
		nil, // horizontalPropertyUseCase - ya no disponible, el módulo es autónomo
		votingCache,
		jwtSecret,
		serviceLogger,
	)
	propertyUnitHandler := handlerpropertyunit.New(propertyUnitUseCase, serviceLogger)
	residentHandler := handlerresident.New(residentUseCase, serviceLogger)
	attendanceHandler := handlerattendance.NewAttendanceHandler(attendanceUseCase, serviceLogger)

	// Registrar rutas
	votingHandler.RegisterRoutes(v1Group)
	propertyUnitHandler.RegisterRoutes(v1Group)
	residentHandler.RegisterRoutes(v1Group)
	attendanceHandler.RegisterRoutes(v1Group)
}
