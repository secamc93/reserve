package repository

import (
	"central_reserve/services/auth/roles/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
)

type Repository struct {
	database db.IDatabase
	logger   log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.IRoleRepository {
	return &Repository{
		database: db,
		logger:   logger,
	}
}
