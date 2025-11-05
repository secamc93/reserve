package actions

import (
	"central_reserve/services/auth/internal/app/usecaseaction"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IActionHandler define la interfaz para el handler de Action
type IActionHandler interface {
	GetActionsHandler(c *gin.Context)
	GetActionByIDHandler(c *gin.Context)
	CreateActionHandler(c *gin.Context)
	UpdateActionHandler(c *gin.Context)
	DeleteActionHandler(c *gin.Context)
}

type ActionHandler struct {
	usecase usecaseaction.IUseCaseAction
	logger  log.ILogger
}

// New crea una nueva instancia del handler de Action
func New(usecase usecaseaction.IUseCaseAction, logger log.ILogger) IActionHandler {
	return &ActionHandler{
		usecase: usecase,
		logger:  logger,
	}
}
