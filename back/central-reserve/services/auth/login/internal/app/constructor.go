package app

import (
	"central_reserve/services/auth/login/internal/domain"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"context"
)

type Iapp interface {
	Login(ctx context.Context, request domain.LoginRequest) (*domain.LoginResponse, error)
	GetUserRolesPermissions(ctx context.Context, userID uint, businessID uint, token string) (*domain.UserRolesPermissionsResponse, error)
	ChangePassword(ctx context.Context, request domain.ChangePasswordRequest) (*domain.ChangePasswordResponse, error)
	GeneratePassword(ctx context.Context, request domain.GeneratePasswordRequest) (*domain.GeneratePasswordResponse, error)
	GenerateBusinessToken(ctx context.Context, userID uint, businessID uint) (string, error)
	// GenerateAPIKey(ctx context.Context, request domain.GenerateAPIKeyRequest) (*domain.GenerateAPIKeyResponse, error)
	// ValidateAPIKey(ctx context.Context, request domain.ValidateAPIKeyRequest) (*domain.ValidateAPIKeyResponse, error)
}

type IAuthUseCase interface {
	ValidateAPIKey(ctx context.Context, request domain.ValidateAPIKeyRequest) (*domain.ValidateAPIKeyResponse, error)
}

type AuthUseCase struct {
	repository domain.IRepository
	jwtService domain.IJWTService
	log        log.ILogger
	env        env.IConfig
}

func New(repository domain.IRepository, jwtService domain.IJWTService, log log.ILogger, env env.IConfig) Iapp {
	return &AuthUseCase{
		repository: repository,
		jwtService: jwtService,
		log:        log,
		env:        env,
	}
}
