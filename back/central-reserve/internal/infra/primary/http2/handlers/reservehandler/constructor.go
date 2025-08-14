package reservehandler

import (
	"central_reserve/internal/app/usecasereserve"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// IReserveHandler define la interfaz para el handler de Reserve
type IReserveHandler interface {
	CreateReserveHandler(c *gin.Context)
	GetReservesHandler(c *gin.Context)
	GetReserveByIDHandler(c *gin.Context)
	CancelReservationHandler(c *gin.Context)
	UpdateReservationHandler(c *gin.Context)
	GetReservationStatusesHandler(c *gin.Context)
}

type ReserveHandler struct {
	usecase usecasereserve.IUseCaseReserve
	logger  log.ILogger
}

// New crea una nueva instancia del handler de Reserve
func New(usecase usecasereserve.IUseCaseReserve, logger log.ILogger) IReserveHandler {
	return &ReserveHandler{
		usecase: usecase,
		logger:  logger,
	}
}
