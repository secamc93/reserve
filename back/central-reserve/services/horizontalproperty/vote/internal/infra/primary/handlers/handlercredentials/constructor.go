package handlercredentials

import (
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasecredentials"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ICredentialsHandler define los handlers de las contraseñas de voto por unidad y grupo.
type ICredentialsHandler interface {
	GenerateCredentials(c *gin.Context)
	ListCredentials(c *gin.Context)
	Router(group *gin.RouterGroup)
}

// CredentialsHandler maneja las peticiones HTTP de contraseñas de voto.
type CredentialsHandler struct {
	useCase usecasecredentials.ICredentialsUseCase
	logger  log.ILogger
}

// New crea el handler de contraseñas de voto.
func New(useCase usecasecredentials.ICredentialsUseCase, logger log.ILogger) ICredentialsHandler {
	return &CredentialsHandler{
		useCase: useCase,
		logger:  logger.WithModule("voting-credentials-handler"),
	}
}
