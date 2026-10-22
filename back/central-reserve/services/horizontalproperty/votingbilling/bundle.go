package votingbilling

import (
	"strconv"

	"central_reserve/services/horizontalproperty/votingbilling/internal/app"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/secondary/repository"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/secondary/wompi"
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// New inicializa el cobro por día de votación (pagos con Wompi y exenciones).
func New(database db.IDatabase, envConfig env.IConfig, logger log.ILogger, v1Group *gin.RouterGroup) {
	logger = logger.WithModule("cobro de votaciones")

	gateway := wompi.New(wompi.Config{
		PublicKey:       envConfig.Get("WOMPI_PUBLIC_KEY"),
		IntegritySecret: envConfig.Get("WOMPI_INTEGRITY_SECRET"),
		EventsSecret:    envConfig.Get("WOMPI_EVENTS_SECRET"),
		APIURL:          envConfig.Get("WOMPI_API_URL"),
	})
	if !gateway.Enabled() {
		logger.Warn().Msg("Wompi sin configurar: los grupos se pueden consultar y exentar, pero no pagar en línea")
	}

	price, _ := strconv.ParseInt(envConfig.Get("VOTING_DAY_PRICE_COP"), 10, 64)
	useCase := app.New(repository.New(database, logger), gateway, price, logger)
	handlers.New(useCase, logger).RegisterRoutes(v1Group)
}
