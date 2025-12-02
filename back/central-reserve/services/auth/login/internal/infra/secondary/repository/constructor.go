package repository

import (
	logindomain "central_reserve/services/auth/login/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
)

type Repository struct {
	database db.IDatabase
	logger   log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) logindomain.IRepository {
	return &Repository{
		database: db,
		logger:   logger,
	}
}
