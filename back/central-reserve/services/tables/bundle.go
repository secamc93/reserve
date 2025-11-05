package tables

import (
	"central_reserve/services/tables/internal/app/usecasetables"
	"central_reserve/services/tables/internal/infra/primary/controllers/tablehandler"
	"central_reserve/services/tables/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func New(db db.IDatabase, env env.IConfig, logger log.ILogger, v1Group *gin.RouterGroup) {
	repository := repository.New(db, logger)
	usecasetables := usecasetables.New(repository, logger)
	handler := tablehandler.New(usecasetables, logger)
	tablehandler.RegisterRoutes(v1Group, handler, logger)
}
