package userhandler

import (
	"central_reserve/services/auth/internal/app/usecaseuser"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IUserHandler define la interfaz del handler de usuarios
type IUserHandler interface {
	GetUsersHandler(c *gin.Context)
	GetUserByIDHandler(c *gin.Context)
	CreateUserHandler(c *gin.Context)
	UpdateUserHandler(c *gin.Context)
	DeleteUserHandler(c *gin.Context)
	RegisterRoutes(router *gin.RouterGroup, handler IUserHandler, logger log.ILogger)
}

// UserHandler maneja las solicitudes HTTP para usuarios
type UserHandler struct {
	usecase usecaseuser.IUseCaseUser
	logger  log.ILogger
}

// New crea una nueva instancia del handler de usuarios
func New(usecase usecaseuser.IUseCaseUser, logger log.ILogger) IUserHandler {
	return &UserHandler{
		usecase: usecase,
		logger:  logger,
	}
}
