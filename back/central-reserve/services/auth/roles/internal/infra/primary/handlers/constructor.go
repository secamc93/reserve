package handlers

import (
	"central_reserve/services/auth/roles/internal/app"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// Ihandlers define la interfaz del handler de roles
type Ihandlers interface {
	GetRolesHandler(c *gin.Context)
	GetRoleByIDHandler(c *gin.Context)
	GetRolesByScopeHandler(c *gin.Context)
	GetRolesByLevelHandler(c *gin.Context)
	GetSystemRolesHandler(c *gin.Context)
	CreateRole(c *gin.Context)
	UpdateRole(c *gin.Context)
	AssignPermissionsToRole(c *gin.Context)
	RemovePermissionFromRole(c *gin.Context)
	GetRolePermissions(c *gin.Context)
	RegisterRoutes(router *gin.RouterGroup, handler Ihandlers, logger log.ILogger)
}

// handlers maneja las solicitudes HTTP para roles
type handlers struct {
	usecase app.Iapp
	logger  log.ILogger
}

// Newhandlers crea una nueva instancia del handler de roles
func New(usecase app.Iapp, logger log.ILogger) Ihandlers {
	return &handlers{
		usecase: usecase,
		logger:  logger,
	}
}
