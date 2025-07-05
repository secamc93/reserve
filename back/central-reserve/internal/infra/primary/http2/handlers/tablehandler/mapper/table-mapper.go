package mapper

import (
	"central_reserve/internal/domain"
	"central_reserve/internal/infra/primary/http2/handlers/tablehandler/request"
)

func TableToDomain(t request.Table) domain.Table {
	return domain.Table{
		RestaurantID: t.RestaurantID,
		Number:       t.Number,
		Capacity:     t.Capacity,
	}
}
