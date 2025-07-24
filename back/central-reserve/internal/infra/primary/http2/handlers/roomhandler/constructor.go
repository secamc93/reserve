package roomhandler

import (
	"central_reserve/internal/app/usecaseroom"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// IRoomHandler define la interfaz para el handler de Room
type IRoomHandler interface {
	CreateRoomHandler(c *gin.Context)
	GetRoomsHandler(c *gin.Context)
	GetRoomsByBusinessHandler(c *gin.Context)
	GetRoomByIDHandler(c *gin.Context)
	UpdateRoomHandler(c *gin.Context)
	DeleteRoomHandler(c *gin.Context)
}

type RoomHandler struct {
	usecase usecaseroom.IUseCaseRoom
	logger  log.ILogger
}

// New crea una nueva instancia del handler de Room
func New(usecase usecaseroom.IUseCaseRoom, logger log.ILogger) IRoomHandler {
	return &RoomHandler{
		usecase: usecase,
		logger:  logger,
	}
}
