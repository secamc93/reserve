package votingbilling

import (
	"central_reserve/services/horizontalproperty/paymentevents/contract"
	"central_reserve/services/horizontalproperty/votingbilling/internal/app"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/events"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/secondary/gateway"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"central_reserve/shared/payments/wompi"

	"github.com/gin-gonic/gin"
)

// New inicializa el cobro por días de votación y devuelve lo que el webhook único de Wompi usa para
// las referencias DIA-….
func New(database db.IDatabase, client *wompi.Client, pricePerDayCOP int64, logger log.ILogger, v1Group *gin.RouterGroup) contract.Applier {
	logger = logger.WithModule("cobro de votaciones")
	useCase := app.New(repository.New(database, logger), gateway.New(client), pricePerDayCOP, logger)
	handlers.New(useCase, logger).RegisterRoutes(v1Group)
	return events.New(useCase)
}
