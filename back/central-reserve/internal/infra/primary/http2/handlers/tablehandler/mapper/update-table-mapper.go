package mapper

import (
	"central_reserve/internal/domain"
	"central_reserve/internal/infra/primary/http2/handlers/tablehandler/request"
)

func UpdateTableToDomain(u request.UpdateTable) domain.Table {
	table := domain.Table{}

	if u.RestaurantID != nil {
		table.RestaurantID = *u.RestaurantID
	}
	if u.Number != nil {
		table.Number = *u.Number
	}
	if u.Capacity != nil {
		table.Capacity = *u.Capacity
	}

	return table
}
