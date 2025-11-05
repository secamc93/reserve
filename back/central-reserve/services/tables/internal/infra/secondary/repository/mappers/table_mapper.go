package mappers

import (
	"central_reserve/services/tables/internal/domain"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// CreateTableModel convierte entities.Table a models.Table
func CreateTableModel(table domain.Table) models.Table {
	return models.Table{
		Model: gorm.Model{
			ID:        table.ID,
			CreatedAt: table.CreatedAt,
			UpdatedAt: table.UpdatedAt,
		},
		Number:     table.Number,
		Capacity:   table.Capacity,
		BusinessID: table.BusinessID,
	}
}

// ToTableEntity convierte models.Table a entities.Table
func ToTableEntity(table models.Table) domain.Table {
	return domain.Table{
		ID:         table.ID,
		Number:     table.Number,
		Capacity:   table.Capacity,
		BusinessID: table.BusinessID,
		CreatedAt:  table.CreatedAt,
		UpdatedAt:  table.UpdatedAt,
	}
}

// ToTableEntitySlice convierte []models.Table a []entities.Table
func ToTableEntitySlice(tables []models.Table) []domain.Table {
	var entities []domain.Table
	for _, table := range tables {
		entities = append(entities, ToTableEntity(table))
	}
	return entities
}
