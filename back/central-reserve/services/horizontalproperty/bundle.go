package horizontalproperty

import (
	"central_reserve/services/horizontalproperty/internal/app/usecasehorizontalproperty"
	"central_reserve/services/horizontalproperty/internal/app/usecasepropertyunit"
	"central_reserve/services/horizontalproperty/internal/app/usecaseresident"
	"central_reserve/services/horizontalproperty/internal/app/usecasevote"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler"
	"central_reserve/services/horizontalproperty/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"central_reserve/shared/storage"

	"github.com/gin-gonic/gin"
)

// New inicializa el servicio de propiedades horizontales con todas sus dependencias
func New(db db.IDatabase, logger log.ILogger, s3 storage.IS3Service, envConfig env.IConfig, v1Group *gin.RouterGroup) {
	// Crear repositorio consolidado
	repo := repository.New(db, logger)
	// Necesitamos el tipo concreto para satisfacer ambos puertos (HorizontalPropertyRepository y VotingRepository)
	repoConcrete := repo.(*repository.Repository)

	// Crear casos de uso
	horizontalPropertyUseCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(
		repo,
		logger,
		s3,
		envConfig,
	)

	// Voting use case (necesita acceso a voting y resident repos)
	votingUseCase := usecasevote.NewVotingUseCase(repoConcrete, repoConcrete, logger)

	// Property Unit use case
	propertyUnitUseCase := usecasepropertyunit.New(repoConcrete, logger)

	// Resident use case
	residentUseCase := usecaseresident.New(repoConcrete, logger)

	// Crear cache de votaciones para SSE en tiempo real
	votingCache := domain.NewVotingCache()

	// Crear handlers
	horizontalPropertyHandler := horizontalpropertyhandler.NewHorizontalPropertyHandler(
		horizontalPropertyUseCase,
		logger,
	)
	// Obtener JWT secret del env
	jwtSecret := envConfig.Get("JWT_SECRET")

	votingHandler := handlervote.NewVotingHandler(
		votingUseCase,
		propertyUnitUseCase,
		horizontalPropertyUseCase,
		votingCache,
		jwtSecret,
		logger,
	)
	propertyUnitHandler := handlerpropertyunit.New(propertyUnitUseCase, logger)
	residentHandler := handlerresident.New(residentUseCase, logger)

	// Registrar rutas
	horizontalPropertyHandler.RegisterRoutes(v1Group)
	votingHandler.RegisterRoutes(v1Group)
	propertyUnitHandler.RegisterRoutes(v1Group)
	residentHandler.RegisterRoutes(v1Group)
}
