package domain

import "context"

// ITableRepository define las operaciones para mesas
type ITableRepository interface {
	CreateTable(ctx context.Context, table entities.Table) (string, error)
	GetTables(ctx context.Context) ([]entities.Table, error)
	GetTableByID(ctx context.Context, id uint) (*entities.Table, error)
	UpdateTable(ctx context.Context, id uint, table entities.Table) (string, error)
	DeleteTable(ctx context.Context, id uint) (string, error)
}
