package usecaseuser

import (
	"central_reserve/services/auth/internal/domain"

	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"context"
)

type IUseCaseUser interface {
	GetUsers(ctx context.Context, filters domain.UserFilters) (*domain.UserListDTO, error)
	GetUserByID(ctx context.Context, id uint) (*domain.UserDTO, error)
	CreateUser(ctx context.Context, user domain.CreateUserDTO) (string, string, string, error)
	UpdateUser(ctx context.Context, id uint, user domain.UpdateUserDTO) (string, error)
	DeleteUser(ctx context.Context, id uint) (string, error)
}

// UserUseCase implementa los casos de uso para usuarios
type UserUseCase struct {
	repository domain.IAuthRepository
	log        log.ILogger
	s3         domain.IS3Service
	env        env.IConfig
}

// NewUserUseCase crea una nueva instancia del caso de uso de usuarios
func New(repository domain.IAuthRepository, log log.ILogger, s3 domain.IS3Service, env env.IConfig) IUseCaseUser {
	return &UserUseCase{
		repository: repository,
		log:        log,
		s3:         s3,
		env:        env,
	}
}
