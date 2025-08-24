package businesshandler

import (
	"central_reserve/internal/app/usecasebusiness"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// IBusinessHandler define la interfaz para el handler de Business
type IBusinessHandler interface {
	GetBusinesses(c *gin.Context)
	GetBusinessByIDHandler(c *gin.Context)
	CreateBusinessHandler(c *gin.Context)
	UpdateBusinessHandler(c *gin.Context)
	DeleteBusinessHandler(c *gin.Context)
	GetBusinessResourcesHandler(c *gin.Context)
	GetBusinessResourceStatusHandler(c *gin.Context)
}

type BusinessHandler struct {
	usecase usecasebusiness.IUseCaseBusiness
	logger  log.ILogger
}

// New crea una nueva instancia del handler de Business
func New(usecase usecasebusiness.IUseCaseBusiness, logger log.ILogger) IBusinessHandler {
	return &BusinessHandler{
		usecase: usecase,
		logger:  logger,
	}
}
