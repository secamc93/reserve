package usecaseauth

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"context"
)

type IUseCaseAuth interface {
	Login(ctx context.Context, request domain.LoginRequest) (*domain.LoginResponse, error)
	GetUserRolesPermissions(ctx context.Context, userID uint, token string) (*domain.UserRolesPermissionsResponse, error)
	ChangePassword(ctx context.Context, request domain.ChangePasswordRequest) (*domain.ChangePasswordResponse, error)
	// GenerateAPIKey(ctx context.Context, request domain.GenerateAPIKeyRequest) (*domain.GenerateAPIKeyResponse, error)
	// ValidateAPIKey(ctx context.Context, request domain.ValidateAPIKeyRequest) (*domain.ValidateAPIKeyResponse, error)
}

type IAuthUseCase interface {
	ValidateAPIKey(ctx context.Context, request domain.ValidateAPIKeyRequest) (*domain.ValidateAPIKeyResponse, error)
}

type AuthUseCase struct {
	repository domain.IAuthRepository
	jwtService domain.IJWTService
	log        log.ILogger
	env        env.IConfig
}

func New(repository domain.IAuthRepository, jwtService domain.IJWTService, log log.ILogger, env env.IConfig) IUseCaseAuth {
	return &AuthUseCase{
		repository: repository,
		jwtService: jwtService,
		log:        log,
		env:        env,
	}
}
