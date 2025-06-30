package holamundohandler

import (
	"central_reserve/internal/app/usecaseorders"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// IHolaMundoHandler define la interfaz para el handler de HolaMundo
type IHolaMundoHandler interface {
	GetHolaMundo(c *gin.Context)
	GetSaludo(c *gin.Context)
	CreateReserveHandler(c *gin.Context)
}

type HolaMundoHandler struct {
	usecase usecaseorders.IUseCaseHolaMundo
	logger  log.ILogger
}

// New crea una nueva instancia del handler de HolaMundo
func New(usecase usecaseorders.IUseCaseHolaMundo, logger log.ILogger) IHolaMundoHandler {
	return &HolaMundoHandler{
		usecase: usecase,
		logger:  logger,
	}
}
