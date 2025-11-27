package horizontalproperty

import (
	"central_reserve/services/horizontalproperty/attendance"
	"central_reserve/services/horizontalproperty/horizontalpropertiy"
	"central_reserve/services/horizontalproperty/internal/infra/secondary/repository"
	"central_reserve/services/horizontalproperty/resident"
	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/services/horizontalproperty/unit"
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

	// Inicializar módulo de propiedades horizontales (NUEVO - autónomo)
	horizontalpropertiy.New(db, logger, s3, envConfig, v1Group)

	// Crear repositorio consolidado (OLD - para otros dominios)
	repoConcrete := repository.New(db, serviceLogger)

	// Voting use case (necesita acceso a voting y resident repos)
	// votingUseCase := voteApp.NewVotingUseCase(repoConcrete, repoConcrete, serviceLogger)

	// Initialize Unit Module
	_, unitAdapter := unit.New(db, serviceLogger, v1Group)

	// Resident use case - Managed by resident module

	// Attendance use case - Managed by attendance module

	// Crear cache de votaciones para SSE en tiempo real
	votingCache := domain.NewVotingCache()

	// Obtener JWT secret del env
	jwtSecret := envConfig.Get("JWT_SECRET")

	// Initialize Vote Module
	vote.New(
		db,
		repoConcrete, // Shared repository implements ResidentRepository
		unitAdapter,
		votingCache,
		jwtSecret,
		serviceLogger,
		v1Group,
	)

	// Initialize Resident Module
	resident.New(db, serviceLogger, v1Group)

	// Initialize Attendance Module
	attendance.New(db, serviceLogger, v1Group)
}
