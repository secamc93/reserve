package login

import (
	"central_reserve/services/auth/login/internal/app"
	"central_reserve/services/auth/login/internal/domain"
	"central_reserve/services/auth/login/internal/infra/primary/handlers"
	"central_reserve/services/auth/login/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New inicializa y registra todos los componentes del módulo de login
func New(database db.IDatabase, logger log.ILogger, jwtService domain.IJWTService, v1Group *gin.RouterGroup) {
	repo := repository.New(database, logger)
	useCase := app.New(repo, jwtService, logger, nil)
	handlerss := handlers.New(useCase, logger)
	handlerss.RegisterRoutes(v1Group, handlerss, logger)
}
