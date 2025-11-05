package repository

import (
	"central_reserve/services/tables/internal/domain"
	"central_reserve/services/tables/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
)

type Repository struct {
	database db.IDatabase
	logger   log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.ITableRepository {
	return &Repository{
		database: db,
		logger:   logger,
	}
}

// CreateTable crea una nueva mesa
func (r *Repository) CreateTable(ctx context.Context, table domain.Table) (string, error) {
	tableModel := mappers.CreateTableModel(table)

	if err := r.database.Conn(ctx).Model(&models.Table{}).Create(&tableModel).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear mesa")
		return "", err
	}

	return fmt.Sprintf("Mesa creada con ID: %d", tableModel.ID), nil
}

// GetTables obtiene todas las mesas
func (r *Repository) GetTables(ctx context.Context) ([]domain.Table, error) {
	var dbTables []models.Table
	if err := r.database.Conn(ctx).Model(&models.Table{}).Find(&dbTables).Error; err != nil {
		r.logger.Error().Msg("Error al obtener mesas")
		return nil, err
	}

	tables := mappers.ToTableEntitySlice(dbTables)
	return tables, nil
}

// GetTableByID obtiene una mesa por su ID
func (r *Repository) GetTableByID(ctx context.Context, id uint) (*domain.Table, error) {
	var dbTable models.Table
	if err := r.database.Conn(ctx).Model(&models.Table{}).Where("id = ?", id).First(&dbTable).Error; err != nil {
		r.logger.Error().Uint("id", id).Msg("Error al obtener mesa por ID")
		return nil, err
	}

	table := mappers.ToTableEntity(dbTable)
	return &table, nil
}

// UpdateTable actualiza una mesa existente
func (r *Repository) UpdateTable(ctx context.Context, id uint, table domain.Table) (string, error) {
	tableModel := mappers.CreateTableModel(table)

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
