package mapper

import (
	"central_reserve/internal/domain/entities"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// CreateTableModel convierte entities.Table a models.Table
func CreateTableModel(table entities.Table) models.Table {
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
func ToTableEntity(table models.Table) entities.Table {
	return entities.Table{
		ID:         table.ID,
		Number:     table.Number,
		Capacity:   table.Capacity,
		BusinessID: table.BusinessID,
		CreatedAt:  table.CreatedAt,
		UpdatedAt:  table.UpdatedAt,
	}
}

// ToTableEntitySlice convierte []models.Table a []entities.Table
func ToTableEntitySlice(tables []models.Table) []entities.Table {
	var entities []entities.Table
	for _, table := range tables {
		entities = append(entities, ToTableEntity(table))
	}
	return entities
}
