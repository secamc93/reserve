package vote

import (
	"central_reserve/services/horizontalproperty/vote/internal/app"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"context"

	"github.com/gin-gonic/gin"
)

func New(
	db db.IDatabase,
	residentRepo domain.ResidentRepository,
	propertyUnitUseCase domain.PropertyUnitUseCase,
	votingCache domain.VotingCacheService,
	jwtSecret string,
	logger log.ILogger,
	router *gin.RouterGroup,
) {
	repo := repository.New(db.Conn(context.Background()), logger)
	votingUseCase := app.NewVotingUseCase(repo, residentRepo, logger)

	handler := handlers.NewVotingHandler(
		votingUseCase,
		repo,
		propertyUnitUseCase,
		nil,
		votingCache,
		jwtSecret,
		logger,
	)
	handler.RegisterRoutes(router)
}
