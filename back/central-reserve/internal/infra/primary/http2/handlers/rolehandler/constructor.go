package rolehandler

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// IRoleHandler define la interfaz del handler de roles
type IRoleHandler interface {
	GetRolesHandler(c *gin.Context)
	GetRoleByIDHandler(c *gin.Context)
	GetRolesByScopeHandler(c *gin.Context)
	GetRolesByLevelHandler(c *gin.Context)
	GetSystemRolesHandler(c *gin.Context)
}

// RoleHandler maneja las solicitudes HTTP para roles
type RoleHandler struct {
	usecase ports.IRoleUseCase
	logger  log.ILogger
}

// NewRoleHandler crea una nueva instancia del handler de roles
func New(usecase ports.IRoleUseCase, logger log.ILogger) IRoleHandler {
	return &RoleHandler{
		usecase: usecase,
		logger:  logger,
	}
}
