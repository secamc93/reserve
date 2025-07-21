package permissionhandler

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// IPermissionHandler define la interfaz para el handler de Permission
type IPermissionHandler interface {
	GetPermissionsHandler(c *gin.Context)
	GetPermissionByIDHandler(c *gin.Context)
	GetPermissionsByScopeHandler(c *gin.Context)
	GetPermissionsByResourceHandler(c *gin.Context)
	CreatePermissionHandler(c *gin.Context)
	UpdatePermissionHandler(c *gin.Context)
	DeletePermissionHandler(c *gin.Context)
}

type PermissionHandler struct {
	usecase ports.IPermissionUseCase
	logger  log.ILogger
}

// New crea una nueva instancia del handler de Permission
func New(usecase ports.IPermissionUseCase, logger log.ILogger) IPermissionHandler {
	return &PermissionHandler{
		usecase: usecase,
		logger:  logger,
	}
}
