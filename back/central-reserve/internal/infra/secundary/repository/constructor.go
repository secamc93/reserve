package repository

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/secundary/repository/db"
	"central_reserve/internal/pkg/log"
)

type Repository struct {
	database db.IDatabase
	logger   log.ILogger
}

// New crea una nueva instancia del repositorio único
func New(database db.IDatabase, logger log.ILogger) *Repository {
	return &Repository{
		database: database,
		logger:   logger,
	}
}

// RepositoryFactory contiene todas las interfaces de repositorio
type RepositoryFactory struct {
	// Repositorios principales
	ClientRepository       ports.IClientRepository
	TableRepository        ports.ITableRepository
	RoomRepository         ports.IRoomRepository
	ReservationRepository  ports.IReservationRepository
	AuthRepository         ports.IAuthRepository
	BusinessTypeRepository ports.IBusinessTypeRepository
	BusinessRepository     ports.IBusinessRepository
	PermissionRepository   ports.IPermissionRepository
	ScopeRepository        ports.IScopeRepository
	RoleRepository         ports.IRoleRepository
	UserRepository         ports.IUserRepository
}

// NewRepositoryFactory crea una nueva instancia de todas las interfaces usando el repositorio unificado
func NewRepositoryFactory(database db.IDatabase, logger log.ILogger) *RepositoryFactory {
	// Crear una sola instancia del repositorio unificado
	repo := New(database, logger)

	return &RepositoryFactory{
		// Repositorios principales - todos usan la misma instancia
		ClientRepository:       repo,
		TableRepository:        repo,
		RoomRepository:         repo,
		ReservationRepository:  repo,
		AuthRepository:         repo,
		BusinessTypeRepository: repo,
		BusinessRepository:     repo,
		PermissionRepository:   repo,
		ScopeRepository:        repo,
		RoleRepository:         repo,
		UserRepository:         repo,
	}
}
