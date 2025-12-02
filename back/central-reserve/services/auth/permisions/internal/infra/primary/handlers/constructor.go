package handlers

import (
	"central_reserve/services/auth/permisions/internal/app"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// Ihandlers define la interfaz para el handler de Permission
type Ihandlers interface {
	GetPermissionsHandler(c *gin.Context)
	GetPermissionByIDHandler(c *gin.Context)
	GetPermissionsByScopeHandler(c *gin.Context)
	GetPermissionsByResourceHandler(c *gin.Context)
	Createhandlers(c *gin.Context)
	Updatehandlers(c *gin.Context)
	Deletehandlers(c *gin.Context)
	RegisterRoutes(router *gin.RouterGroup, handler Ihandlers, logger log.ILogger)
}

type handlers struct {
	usecase app.Iapp
	logger  log.ILogger
}

// New crea una nueva instancia del handler de Permission
func New(usecase app.Iapp, logger log.ILogger) Ihandlers {
	return &handlers{
		usecase: usecase,
		logger:  logger,
	}
}
