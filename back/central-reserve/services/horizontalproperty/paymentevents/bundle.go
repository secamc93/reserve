package paymentevents

import (
	"central_reserve/services/horizontalproperty/paymentevents/contract"
	"central_reserve/services/horizontalproperty/paymentevents/internal/infra/primary/handlers"
	"central_reserve/shared/log"
	"central_reserve/shared/payments/wompi"

	"github.com/gin-gonic/gin"
)

// New registra el webhook único de Wompi. appliers va por prefijo de referencia.
func New(client *wompi.Client, appliers map[string]contract.Applier, logger log.ILogger, v1Group *gin.RouterGroup) {
	handlers.New(client, appliers, logger.WithModule("eventos de pago")).RegisterRoutes(v1Group)
}
