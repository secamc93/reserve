package handlers

import (
	"strings"

	"central_reserve/services/horizontalproperty/paymentevents/contract"
	"central_reserve/shared/log"
	"central_reserve/shared/payments/wompi"

	"github.com/gin-gonic/gin"
)

// IHandler recibe los eventos de Wompi.
type IHandler interface {
	WompiEvents(c *gin.Context)
	RegisterRoutes(router *gin.RouterGroup)
}

type handler struct {
	client   *wompi.Client
	appliers map[string]contract.Applier
	logger   log.ILogger
}

// New crea el webhook. appliers va por prefijo de referencia (p. ej. "DIA-", "MEMB-").
func New(client *wompi.Client, appliers map[string]contract.Applier, logger log.ILogger) IHandler {
	return &handler{client: client, appliers: appliers, logger: logger}
}

// applierFor devuelve el módulo dueño de la referencia, o nil si ninguno la reconoce.
func (h *handler) applierFor(reference string) contract.Applier {
	for prefix, a := range h.appliers {
		if strings.HasPrefix(reference, prefix) {
			return a
		}
	}
	return nil
}
