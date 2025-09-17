package resources

import (
	"central_reserve/services/auth/internal/app/usecaseresource"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IResourceHandler define la interfaz para el handler de Resource
type IResourceHandler interface {
	GetResourcesHandler(c *gin.Context)
	GetResourceByIDHandler(c *gin.Context)
	CreateResourceHandler(c *gin.Context)
	UpdateResourceHandler(c *gin.Context)
	DeleteResourceHandler(c *gin.Context)
}

type ResourceHandler struct {
	usecase usecaseresource.IUseCaseResource
	logger  log.ILogger
}

// New crea una nueva instancia del handler de Resource
func New(usecase usecaseresource.IUseCaseResource, logger log.ILogger) IResourceHandler {
	return &ResourceHandler{
		usecase: usecase,
		logger:  logger,
	}
}
