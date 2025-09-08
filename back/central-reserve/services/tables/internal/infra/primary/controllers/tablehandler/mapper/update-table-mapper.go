package mapper

import (
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/primary/http2/handlers/tablehandler/request"
)

// UpdateTableToDomain convierte un request.UpdateTable a entities.Table
func UpdateTableToDomain(u request.UpdateTable) entities.Table {
	table := entities.Table{}

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
