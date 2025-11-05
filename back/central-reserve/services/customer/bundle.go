package customer

import (
	"central_reserve/services/customer/internal/app/usecaseclient"
	"central_reserve/services/customer/internal/infra/primary/handlers/clienthandler"
	"central_reserve/services/customer/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func New(db db.IDatabase, env env.IConfig, logger log.ILogger, v1Group *gin.RouterGroup) {
	repository := repository.New(db, logger)

	usecaseclient := usecaseclient.New(repository)

	handler := clienthandler.New(usecaseclient, logger)

	clienthandler.RegisterRoutes(v1Group, handler)
}
