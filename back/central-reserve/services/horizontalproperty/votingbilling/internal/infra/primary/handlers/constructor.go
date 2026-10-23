package handlers

import (
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/ports"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IHandler expone los endpoints del cobro por días de votación.
type IHandler interface {
	GetCoverage(c *gin.Context)
	CreateDaysCheckout(c *gin.Context)
	SyncTransaction(c *gin.Context)
	GrantDays(c *gin.Context)
	SetPropertyExemption(c *gin.Context)
	ListPropertyAdmins(c *gin.Context)
	SetAdminExemption(c *gin.Context)
	RegisterRoutes(router *gin.RouterGroup)
}

type handler struct {
	useCase ports.IUseCase
	logger  log.ILogger
}

// New crea el handler del cobro por días de votación.
func New(useCase ports.IUseCase, logger log.ILogger) IHandler {
	return &handler{useCase: useCase, logger: logger}
}
