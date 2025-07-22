package usecaseauth

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/jwt"
	"central_reserve/internal/pkg/log"
	"context"
)

type IUseCaseAuth interface {
	Login(ctx context.Context, request dtos.LoginRequest) (*dtos.LoginResponse, error)
	GetUserRolesPermissions(ctx context.Context, userID uint, token string) (*dtos.UserRolesPermissionsResponse, error)
	ChangePassword(ctx context.Context, request dtos.ChangePasswordRequest) (*dtos.ChangePasswordResponse, error)
}

type AuthUseCase struct {
	repository ports.IAuthUseCaseRepository
	jwtService *jwt.JWTService
	log        log.ILogger
}

func NewAuthUseCase(repository ports.IAuthUseCaseRepository, jwtService *jwt.JWTService, log log.ILogger) IUseCaseAuth {
	return &AuthUseCase{
		repository: repository,
		jwtService: jwtService,
		log:        log,
	}
}
