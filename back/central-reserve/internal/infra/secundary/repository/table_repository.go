package repository

import (
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/secundary/repository/mapper"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
)

// TableRepository implementa ports.ITableRepository

// CreateTable crea una nueva mesa
func (r *Repository) CreateTable(ctx context.Context, table entities.Table) (string, error) {
	tableModel := mapper.CreateTableModel(table)

	if err := r.database.Conn(ctx).Model(&models.Table{}).Create(&tableModel).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear mesa")
		return "", err
	}

	return fmt.Sprintf("Mesa creada con ID: %d", tableModel.ID), nil
}

// GetTables obtiene todas las mesas
func (r *Repository) GetTables(ctx context.Context) ([]entities.Table, error) {
	var dbTables []models.Table
	if err := r.database.Conn(ctx).Model(&models.Table{}).Find(&dbTables).Error; err != nil {
		r.logger.Error().Msg("Error al obtener mesas")
		return nil, err
	}

	tables := mapper.ToTableEntitySlice(dbTables)
	return tables, nil
}

// GetTableByID obtiene una mesa por su ID
func (r *Repository) GetTableByID(ctx context.Context, id uint) (*entities.Table, error) {
	var dbTable models.Table
	if err := r.database.Conn(ctx).Model(&models.Table{}).Where("id = ?", id).First(&dbTable).Error; err != nil {
		r.logger.Error().Uint("id", id).Msg("Error al obtener mesa por ID")
		return nil, err
	}

	table := mapper.ToTableEntity(dbTable)
	return &table, nil
}

// UpdateTable actualiza una mesa existente
func (r *Repository) UpdateTable(ctx context.Context, id uint, table entities.Table) (string, error) {
	tableModel := mapper.CreateTableModel(table)

	if err := r.database.Conn(ctx).Model(&models.Table{}).Where("id = ?", id).Updates(&tableModel).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar mesa")
		return "", err
	}

	return fmt.Sprintf("Mesa actualizada con ID: %d", id), nil
}

// DeleteTable elimina una mesa
func (r *Repository) DeleteTable(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Model(&models.Table{}).Where("id = ?", id).Delete(&models.Table{}).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar mesa")
		return "", err
	}

	return fmt.Sprintf("Mesa eliminada con ID: %d", id), nil
}
