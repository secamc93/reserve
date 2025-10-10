package horizontalproperty

import (
	"central_reserve/services/horizontalproperty/internal/app/usecasehorizontalproperty"
	"central_reserve/services/horizontalproperty/internal/app/usecasevote"
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

	// Voting use case
	votingUseCase := usecasevote.NewVotingUseCase(repoConcrete, logger)

	// Crear handlers
	horizontalPropertyHandler := horizontalpropertyhandler.NewHorizontalPropertyHandler(
		horizontalPropertyUseCase,
		logger,
	)
	votingHandler := handlervote.NewVotingHandler(
		votingUseCase,
		logger,
	)

	// Registrar rutas
	horizontalPropertyHandler.RegisterRoutes(v1Group)
	votingHandler.RegisterRoutes(v1Group)
}
