package rooms

import (
	"central_reserve/services/rooms/internal/app/usecaseroom"
	"central_reserve/services/rooms/internal/infra/primary/controllers/roomhandler"
	"central_reserve/services/rooms/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func New(db db.IDatabase, env env.IConfig, logger log.ILogger, v1Group *gin.RouterGroup) {
	repository := repository.New(db, logger)
	usecaseroom := usecaseroom.New(repository, logger)
	handler := roomhandler.New(usecaseroom, logger)
	roomhandler.RegisterRoutes(v1Group, handler, logger)
}
