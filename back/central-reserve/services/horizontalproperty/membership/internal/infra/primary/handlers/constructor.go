package handlers

import (
	"central_reserve/services/horizontalproperty/membership/internal/domain/ports"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IHandler expone los endpoints de membresías.
type IHandler interface {
	ListPlans(c *gin.Context)
	ListForBusiness(c *gin.Context)
	ListMine(c *gin.Context)
	CreateCheckout(c *gin.Context)
	SyncTransaction(c *gin.Context)
	Grant(c *gin.Context)
	RegisterRoutes(router *gin.RouterGroup)
}

type handler struct {
	useCase ports.IUseCase
	logger  log.ILogger
}

// New crea el handler de membresías.
func New(useCase ports.IUseCase, logger log.ILogger) IHandler {
	return &handler{useCase: useCase, logger: logger}
}
