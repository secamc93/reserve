package domain

import "context"

// ITableRepository define las operaciones para mesas
type ITableRepository interface {
	CreateTable(ctx context.Context, table Table) (string, error)
	GetTables(ctx context.Context) ([]Table, error)
	GetTableByID(ctx context.Context, id uint) (*Table, error)
	UpdateTable(ctx context.Context, id uint, table Table) (string, error)
	DeleteTable(ctx context.Context, id uint) (string, error)
}
