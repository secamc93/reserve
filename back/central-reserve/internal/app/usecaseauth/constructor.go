package usecaseauth

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/log"
	"context"
)

type IUseCaseAuth interface {
	Login(ctx context.Context, request dtos.LoginRequest) (*dtos.LoginResponse, error)
	GetUserRolesPermissions(ctx context.Context, userID uint, token string) (*dtos.UserRolesPermissionsResponse, error)
	ChangePassword(ctx context.Context, request dtos.ChangePasswordRequest) (*dtos.ChangePasswordResponse, error)
	GenerateAPIKey(ctx context.Context, request dtos.GenerateAPIKeyRequest) (*dtos.GenerateAPIKeyResponse, error)
	ValidateAPIKey(ctx context.Context, request dtos.ValidateAPIKeyRequest) (*dtos.ValidateAPIKeyResponse, error)
}

type IAuthUseCase interface {
	ValidateAPIKey(ctx context.Context, request dtos.ValidateAPIKeyRequest) (*dtos.ValidateAPIKeyResponse, error)
}

type AuthUseCase struct {
	repository ports.IAuthRepository
	jwtService ports.IJWTService
	log        log.ILogger
	env        env.IConfig
}

func NewAuthUseCase(repository ports.IAuthRepository, jwtService ports.IJWTService, log log.ILogger, env env.IConfig) IUseCaseAuth {
	return &AuthUseCase{
		repository: repository,
		jwtService: jwtService,
		log:        log,
		env:        env,
	}
}
