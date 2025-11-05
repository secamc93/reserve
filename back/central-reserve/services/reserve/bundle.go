package reserve

import (
	"central_reserve/services/reserve/internal/app/usecasereserve"
	"central_reserve/services/reserve/internal/infra/primary/controllers/reservehandler"
	"central_reserve/services/reserve/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/email"
	"central_reserve/shared/env"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func New(db db.IDatabase, env env.IConfig, logger log.ILogger, email email.IEmailService, v1Group *gin.RouterGroup) {
	repository := repository.New(db, logger)
	usecasereserve := usecasereserve.New(repository, email, logger)
	handler := reservehandler.New(usecasereserve, logger)
	reservehandler.RegisterRoutes(v1Group, handler, logger)
}
