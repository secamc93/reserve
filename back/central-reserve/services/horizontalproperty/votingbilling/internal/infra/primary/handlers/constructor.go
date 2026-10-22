package handlers

import (
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/ports"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IHandler expone los endpoints del cobro por día de votación.
type IHandler interface {
	GetStatus(c *gin.Context)
	CreateCheckout(c *gin.Context)
	SyncTransaction(c *gin.Context)
	RegisterManualPayment(c *gin.Context)
	SetExemption(c *gin.Context)
	WompiEvents(c *gin.Context)
	RegisterRoutes(router *gin.RouterGroup)
}

type handler struct {
	useCase ports.IUseCase
	logger  log.ILogger
}

// New crea el handler del cobro por día de votación.
func New(useCase ports.IUseCase, logger log.ILogger) IHandler {
	return &handler{useCase: useCase, logger: logger}
}
