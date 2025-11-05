package mapper

import (
	"central_reserve/services/tables/internal/domain"
	"central_reserve/services/tables/internal/infra/primary/controllers/tablehandler/request"
)

// TableToDomain convierte un request.Table a entities.Table
func TableToDomain(t request.Table) domain.Table {
	return domain.Table{
		BusinessID: t.BusinessID,
		Number:     t.Number,
		Capacity:   t.Capacity,
	}
}
