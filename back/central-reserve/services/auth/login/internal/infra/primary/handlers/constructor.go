package handlers

import (
	"central_reserve/services/auth/login/internal/app"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// Ihandlers define la interfaz del handler de autenticación
type Ihandlers interface {
	LoginHandler(c *gin.Context)
	VerifyHandler(c *gin.Context)
	GetUserRolesPermissionsHandler(c *gin.Context)
	ChangePasswordHandler(c *gin.Context)
	GeneratePasswordHandler(c *gin.Context)
	GenerateBusinessTokenHandler(c *gin.Context)
	RegisterRoutes(v1Group *gin.RouterGroup, handler Ihandlers, logger log.ILogger)
	// GenerateAPIKeyHandler(c *gin.Context)
	// ValidateAPIKeyHandler(c *gin.Context)
}

type handlers struct {
	usecase app.Iapp
	logger  log.ILogger
}

// New crea una nueva instancia del handler de autenticación
func New(usecase app.Iapp, logger log.ILogger) Ihandlers {
	contextualLogger := logger.WithModule("autenticación")
	return &handlers{
		usecase: usecase,
		logger:  contextualLogger,
	}
}
