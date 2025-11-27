package vote

import (
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasepublic"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecaseresults"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecaseshared"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotes"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotinggroups"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotingoptions"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotings"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlerpublic"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlerresults"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlervotes"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlervotinggroups"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlervotingoptions"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlervotings"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/cache"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func New(db db.IDatabase, jwtSecret string, logger log.ILogger, router *gin.RouterGroup) {
	logger = logger.WithModule("votaciones")
	repo := repository.New(db, logger)
	votingCache := cache.New()

	// Crear instancias modulares de casos de uso
	votingGroupsUseCase := usecasevotinggroups.New(repo, votingCache, logger)
	votingsUseCase := usecasevotings.New(repo, votingCache, logger)
	votingOptionsUseCase := usecasevotingoptions.New(repo, votingCache, logger)
	votesUseCase := usecasevotes.New(repo, votingCache, logger)
	publicUseCase := usecasepublic.New(repo, votingCache, logger)
	resultsUseCase := usecaseresults.New(repo, votingCache, logger)
	sharedUseCase := usecaseshared.New(repo, votingCache, logger)

	// Crear instancias modulares de handlers
	votingGroupsHandler := handlervotinggroups.New(votingGroupsUseCase, logger)
	votingsHandler := handlervotings.New(votingsUseCase, logger)
	votingOptionsHandler := handlervotingoptions.New(votingOptionsUseCase, logger)
	votesHandler := handlervotes.New(votesUseCase, logger)
	resultsHandler := handlerresults.New(resultsUseCase, votingsUseCase, votesUseCase, votingCache, logger)
	publicHandler := handlerpublic.New(publicUseCase, votingGroupsUseCase, votingsUseCase, votesUseCase, resultsUseCase, sharedUseCase, votingCache, jwtSecret, logger)

	// Crear handler orquestador
	handler := handlers.New(
		votingGroupsHandler,
		votingsHandler,
		resultsHandler,
		votingOptionsHandler,
		votesHandler,
		publicHandler,
	)
	handler.RegisterRoutes(router)
}
