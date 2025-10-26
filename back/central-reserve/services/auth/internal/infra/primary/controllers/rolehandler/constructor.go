package rolehandler

import (
	"central_reserve/services/auth/internal/app/usecaserole"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IRoleHandler define la interfaz del handler de roles
type IRoleHandler interface {
	GetRolesHandler(c *gin.Context)
	GetRoleByIDHandler(c *gin.Context)
	GetRolesByScopeHandler(c *gin.Context)
	GetRolesByLevelHandler(c *gin.Context)
	GetSystemRolesHandler(c *gin.Context)
	CreateRole(c *gin.Context)
	UpdateRole(c *gin.Context)
	RegisterRoutes(router *gin.RouterGroup, handler IRoleHandler, logger log.ILogger)
}

// RoleHandler maneja las solicitudes HTTP para roles
type RoleHandler struct {
	usecase usecaserole.IUseCaseRole
	logger  log.ILogger
}

// NewRoleHandler crea una nueva instancia del handler de roles
func New(usecase usecaserole.IUseCaseRole, logger log.ILogger) IRoleHandler {
	return &RoleHandler{
		usecase: usecase,
		logger:  logger,
	}
}
