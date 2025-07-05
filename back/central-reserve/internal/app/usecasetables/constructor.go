package usecasetables

import (
	"central_reserve/internal/domain"
	"central_reserve/internal/pkg/log"
	"context"
)

type IUseCaseTable interface {
	CreateTable(ctx context.Context, table domain.Table) (string, error)
	GetTables(ctx context.Context) ([]domain.Table, error)
	GetTableByID(ctx context.Context, id uint) (*domain.Table, error)
	UpdateTable(ctx context.Context, id uint, table domain.Table) (string, error)
	DeleteTable(ctx context.Context, id uint) (string, error)
}

type TableUseCase struct {
	repository domain.IHolaMundo
	log        log.ILogger
}

func NewTableUseCase(repository domain.IHolaMundo, log log.ILogger) IUseCaseTable {
	return &TableUseCase{
		repository: repository,
		log:        log,
	}
}
