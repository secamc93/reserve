package repository

import (
	"dbpostgres/app/domain"
	"dbpostgres/pkg/log"

	"gorm.io/gorm"
)

// RepositoryManager maneja todas las instancias de repositorios
type RepositoryManager struct {
	domain.PermissionRepository
	domain.RoleRepository
	domain.UserRepository
	domain.BusinessRepository
	domain.TableRepository
	domain.ReservationStatusRepository
}

// NewRepositoryManager crea una nueva instancia del manager de repositorios
func NewRepositoryManager(db *gorm.DB, logger log.ILogger) *RepositoryManager {
	return &RepositoryManager{
		PermissionRepository:        NewPermissionRepository(db, logger),
		RoleRepository:              NewRoleRepository(db, logger),
		UserRepository:              NewUserRepository(db, logger),
		BusinessRepository:          NewBusinessRepository(db, logger),
		TableRepository:             NewTableRepository(db, logger),
		ReservationStatusRepository: NewReservationStatusRepository(db, logger),
	}
}
