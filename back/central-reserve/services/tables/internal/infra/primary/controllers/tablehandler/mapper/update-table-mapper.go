package mapper

import (
	"central_reserve/services/tables/internal/domain"
	"central_reserve/services/tables/internal/infra/primary/controllers/tablehandler/request"
)

// UpdateTableToDomain convierte un request.UpdateTable a entities.Table
func UpdateTableToDomain(u request.UpdateTable) domain.Table {
	table := domain.Table{}

	if u.BusinessID != nil {
		table.BusinessID = *u.BusinessID
	}
	if u.Number != nil {
		table.Number = *u.Number
	}
	if u.Capacity != nil {
		table.Capacity = *u.Capacity
	}

	return table
}
