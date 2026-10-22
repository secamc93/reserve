package repository

import (
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/ports"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
)

type repository struct {
	db     db.IDatabase
	logger log.ILogger
}

// New crea el repositorio del cobro por día de votación.
func New(database db.IDatabase, logger log.ILogger) ports.IRepository {
	return &repository{db: database, logger: logger}
}
