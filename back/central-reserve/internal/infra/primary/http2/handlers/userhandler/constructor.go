package userhandler

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// IUserHandler define la interfaz del handler de usuarios
type IUserHandler interface {
	GetUsersHandler(c *gin.Context)
	GetUserByIDHandler(c *gin.Context)
	CreateUserHandler(c *gin.Context)
	UpdateUserHandler(c *gin.Context)
	DeleteUserHandler(c *gin.Context)
}

// UserHandler maneja las solicitudes HTTP para usuarios
type UserHandler struct {
	usecase ports.IUserUseCase
	logger  log.ILogger
}

// New crea una nueva instancia del handler de usuarios
func New(usecase ports.IUserUseCase, logger log.ILogger) IUserHandler {
	return &UserHandler{
		usecase: usecase,
		logger:  logger,
	}
}
