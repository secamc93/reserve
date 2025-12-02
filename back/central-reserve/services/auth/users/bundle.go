package users

import (
	"central_reserve/services/auth/users/internal/app"
	"central_reserve/services/auth/users/internal/domain"
	"central_reserve/services/auth/users/internal/infra/primary/handlers"
	"central_reserve/services/auth/users/internal/infra/secondary/repository"

	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New inicializa el módulo de usuarios con todas sus dependencias
func New(db db.IDatabase, env env.IConfig, logger log.ILogger, s3 domain.IS3Service, v1Group *gin.RouterGroup) {
	userRepository := repository.New(db, logger)
	userUseCase := app.New(userRepository, logger, s3, env)
	userHandlers := handlers.New(userUseCase, logger)
	userHandlers.RegisterRoutes(v1Group, userHandlers, logger)
}
