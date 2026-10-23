package membership

import (
	"central_reserve/services/horizontalproperty/membership/internal/app"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/events"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/membership/internal/infra/secondary/gateway"
	"central_reserve/services/horizontalproperty/membership/internal/infra/secondary/repository"
	"central_reserve/services/horizontalproperty/paymentevents/contract"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"central_reserve/shared/payments/wompi"

	"github.com/gin-gonic/gin"
)

// New inicializa las membresías y devuelve lo que el webhook único de Wompi usa para las
// referencias MEMB-….
func New(database db.IDatabase, client *wompi.Client, logger log.ILogger, v1Group *gin.RouterGroup) contract.Applier {
	logger = logger.WithModule("membresías")
	useCase := app.New(repository.New(database, logger), gateway.New(client), logger)
	handlers.New(useCase, logger).RegisterRoutes(v1Group)
	return events.New(useCase)
}
