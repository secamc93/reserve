package usecaseuser

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/log"
	"context"
)

type IUseCaseUser interface {
	GetUsers(ctx context.Context, filters dtos.UserFilters) (*dtos.UserListDTO, error)
	GetUserByID(ctx context.Context, id uint) (*dtos.UserDTO, error)
	CreateUser(ctx context.Context, user dtos.CreateUserDTO) (string, string, string, error)
	UpdateUser(ctx context.Context, id uint, user dtos.UpdateUserDTO) (string, error)
	DeleteUser(ctx context.Context, id uint) (string, error)
}

// UserUseCase implementa los casos de uso para usuarios
type UserUseCase struct {
	repository ports.IUserRepository
	log        log.ILogger
}

// NewUserUseCase crea una nueva instancia del caso de uso de usuarios
func NewUserUseCase(repository ports.IUserRepository, log log.ILogger) IUseCaseUser {
	return &UserUseCase{
		repository: repository,
		log:        log,
	}
}
