package authhandler

import (
	"central_reserve/internal/app/usecaseauth"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// IAuthHandler define la interfaz del handler de autenticación
type IAuthHandler interface {
	LoginHandler(c *gin.Context)
	VerifyHandler(c *gin.Context)
	GetUserRolesPermissionsHandler(c *gin.Context)
	ChangePasswordHandler(c *gin.Context)
	GenerateAPIKeyHandler(c *gin.Context)
	ValidateAPIKeyHandler(c *gin.Context)
}

type AuthHandler struct {
	usecase usecaseauth.IUseCaseAuth
	logger  log.ILogger
}

// New crea una nueva instancia del handler de autenticación
func New(usecase usecaseauth.IUseCaseAuth, logger log.ILogger) IAuthHandler {
	return &AuthHandler{
		usecase: usecase,
		logger:  logger,
	}
}
