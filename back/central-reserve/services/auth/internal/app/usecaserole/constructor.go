package usecaserole

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/shared/log"
	"context"
	"fmt"
)

type IUseCaseRole interface {
	GetRoles(ctx context.Context, filters domain.RoleFilters) ([]domain.RoleDTO, error)
	GetRoleByID(ctx context.Context, id uint) (*domain.RoleDTO, error)
	GetRolesByLevel(ctx context.Context, filters domain.RoleFilters) ([]domain.RoleDTO, error)
	GetRolesByScopeID(ctx context.Context, scopeID uint) ([]domain.RoleDTO, error)
	GetSystemRoles(ctx context.Context) ([]domain.RoleDTO, error)
	CreateRole(ctx context.Context, roleDTO domain.CreateRoleDTO) (*domain.Role, error)
	UpdateRole(ctx context.Context, id uint, roleDTO domain.UpdateRoleDTO) (*domain.Role, error)
	AssignPermissionsToRole(ctx context.Context, roleID uint, permissionIDs []uint) error
	RemovePermissionFromRole(ctx context.Context, roleID uint, permissionID uint) error
	GetRolePermissions(ctx context.Context, roleID uint) ([]domain.Permission, error)
}

// RoleUseCase implementa los casos de uso para roles
type RoleUseCase struct {
	repository domain.IAuthRepository
	log        log.ILogger
}

// NewRoleUseCase crea una nueva instancia del caso de uso de roles
func New(repository domain.IAuthRepository, log log.ILogger) IUseCaseRole {
	return &RoleUseCase{
		repository: repository,
		log:        log,
	}
}

// CreateRole crea un nuevo rol
func (uc *RoleUseCase) CreateRole(ctx context.Context, roleDTO domain.CreateRoleDTO) (*domain.Role, error) {
	uc.log.Info().
		Str("name", roleDTO.Name).
		Uint("scope_id", roleDTO.ScopeID).
		Uint("business_type_id", roleDTO.BusinessTypeID).
		Msg("Creando nuevo rol")

	// Crear el rol usando el repositorio
	role, err := uc.repository.CreateRole(ctx, roleDTO)
	if err != nil {
		uc.log.Error().
			Err(err).
			Str("name", roleDTO.Name).
			Msg("Error al crear rol")
		return nil, err
	}

	uc.log.Info().
		Uint("role_id", role.ID).
		Str("name", role.Name).
		Msg("Rol creado exitosamente")

	return role, nil
}

// UpdateRole actualiza un rol existente
func (uc *RoleUseCase) UpdateRole(ctx context.Context, id uint, roleDTO domain.UpdateRoleDTO) (*domain.Role, error) {
	uc.log.Info().
		Uint("role_id", id).
		Msg("Actualizando rol")

	// Verificar que el rol existe
	existingRole, err := uc.repository.GetRoleByID(ctx, id)
	if err != nil {
		uc.log.Error().
			Err(err).
			Uint("role_id", id).
			Msg("Error al verificar existencia del rol")
		return nil, err
	}

	if existingRole == nil {
		uc.log.Error().
			Uint("role_id", id).
			Msg("Rol no encontrado")
		return nil, fmt.Errorf("rol no encontrado")
	}

	// Actualizar el rol usando el repositorio
	role, err := uc.repository.UpdateRole(ctx, id, roleDTO)
	if err != nil {
		uc.log.Error().
			Err(err).
			Uint("role_id", id).
			Msg("Error al actualizar rol")
		return nil, err
	}

	uc.log.Info().
		Uint("role_id", role.ID).
		Str("name", role.Name).
		Msg("Rol actualizado exitosamente")

	return role, nil
}
