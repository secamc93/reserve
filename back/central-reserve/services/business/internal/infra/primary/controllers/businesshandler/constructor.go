package businesshandler

import (
	"central_reserve/services/business/internal/app/usecasebusiness"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IBusinessHandler define la interfaz para el handler de Business
type IBusinessHandler interface {
	GetBusinesses(c *gin.Context)
	GetBusinessByIDHandler(c *gin.Context)
	CreateBusinessHandler(c *gin.Context)
	UpdateBusinessHandler(c *gin.Context)
	DeleteBusinessHandler(c *gin.Context)
	RegisterRoutes(router *gin.RouterGroup, handler IBusinessHandler)
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
