package clienthandler

import (
	"central_reserve/internal/app/usecaseclient"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// IClientHandler define la interfaz para el handler de Client
type IClientHandler interface {
	GetClientsHandler(c *gin.Context)
	GetClientByIDHandler(c *gin.Context)
	CreateClientHandler(c *gin.Context)
	UpdateClientHandler(c *gin.Context)
	DeleteClientHandler(c *gin.Context)
}

type ClientHandler struct {
	usecase usecaseclient.IUseCaseClient
	logger  log.ILogger
}

// New crea una nueva instancia del handler de Client
func New(usecase usecaseclient.IUseCaseClient, logger log.ILogger) IClientHandler {
	return &ClientHandler{
		usecase: usecase,
		logger:  logger,
	}
}
