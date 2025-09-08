package mapper

import (
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/primary/http2/handlers/tablehandler/request"
)

// TableToDomain convierte un request.Table a entities.Table
func TableToDomain(t request.Table) entities.Table {
	return entities.Table{
		BusinessID: t.BusinessID,
		Number:     t.Number,
		Capacity:   t.Capacity,
	}
}
