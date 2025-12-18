package dashboard

import (
	"central_reserve/services/horizontalproperty/dashboard/internal/app"
	"central_reserve/services/horizontalproperty/dashboard/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/dashboard/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func New(db db.IDatabase, env env.IConfig, logger log.ILogger, router *gin.RouterGroup) {
	repo := repository.New(db, env, logger)
	useCase := app.New(repo, logger)
	handler := handlers.New(useCase, logger)
	handler.RegisterRoutes(router)
}


