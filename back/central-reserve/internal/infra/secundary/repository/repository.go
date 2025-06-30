package repository

import (
	"central_reserve/internal/domain"
	"central_reserve/internal/infra/secundary/repository/db"
	"central_reserve/internal/pkg/log"
	"context"
)

type Repository struct {
	database db.IDatabase
	logger   log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.IHolaMundo {
	return Repository{
		database: db,
		logger:   logger,
	}
}

func (r Repository) HolaMundo() string {
	return "Hola Mundo"
}

func (r Repository) CreateReserve(ctx context.Context, reserve domain.Reservation) (string, error) {
	if err := r.database.Conn(ctx).Table("reservation").Create(&reserve).Error; err != nil {
		r.logger.Error().Msg("Error al crear reserva")
		return "", err
	}
	return "Reserva creada exitosamente", nil
}
