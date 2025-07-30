package usecaseauth

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// GetUserRolesPermissions maneja la lógica para obtener roles y permisos del usuario
func (uc *AuthUseCase) GetUserRolesPermissions(ctx context.Context, userID uint, token string) (*dtos.UserRolesPermissionsResponse, error) {
	uc.log.Info().Uint("user_id", userID).Msg("Obteniendo roles y permisos del usuario")

	// Validar token
	if token == "" {
		uc.log.Error().Msg("Token requerido")
		return nil, fmt.Errorf("token inválido")
	}

	// Verificar que el token sea válido y obtener claims
	claims, err := uc.jwtService.ValidateToken(token)
	if err != nil {
		uc.log.Error().Err(err).Msg("Token inválido")
		return nil, fmt.Errorf("token inválido")
	}

	// Verificar que el usuario del token coincida con el userID solicitado
	if claims.UserID != userID {
		uc.log.Error().
			Uint("token_user_id", claims.UserID).
			Uint("requested_user_id", userID).
			Msg("El token no corresponde al usuario solicitado")
		return nil, fmt.Errorf("acceso denegado")
	}

	// Obtener usuario para verificar que existe
	user, err := uc.repository.GetUserByEmail(ctx, claims.Email)
	if err != nil {
		uc.log.Error().Err(err).Uint("user_id", userID).Msg("Error al obtener usuario")
		return nil, fmt.Errorf("usuario no encontrado")
	}

	if user == nil {
		uc.log.Error().Uint("user_id", userID).Msg("Usuario no encontrado")
		return nil, fmt.Errorf("usuario no encontrado")
	}

	// Verificar que el usuario esté activo
	if !user.IsActive {
		uc.log.Error().Uint("user_id", userID).Msg("Usuario inactivo")
		return nil, fmt.Errorf("usuario inactivo")
	}

	// Obtener roles del usuario
	roles, err := uc.repository.GetUserRoles(ctx, userID)
	if err != nil {
		uc.log.Error().Err(err).Uint("user_id", userID).Msg("Error al obtener roles del usuario")
		return nil, fmt.Errorf("error interno del servidor")
	}

	// Obtener permisos de todos los roles del usuario
	var allPermissions []entities.Permission
	for _, role := range roles {
		permissions, err := uc.repository.GetRolePermissions(ctx, role.ID)
		if err != nil {
			uc.log.Error().Err(err).Uint("role_id", role.ID).Msg("Error al obtener permisos del rol")
			continue
		}
		allPermissions = append(allPermissions, permissions...)
	}

	// Verificar si es super admin (tiene rol super_admin)
	isSuper := false
	for _, role := range roles {
		if role.Code == "super_admin" {
			isSuper = true
			break
		}
	}

	// Construir respuesta
	response := &dtos.UserRolesPermissionsResponse{
		Success:     true,
		Message:     "Roles y permisos obtenidos exitosamente",
		UserID:      userID,
		Email:       user.Email,
		IsSuper:     isSuper,
		Roles:       make([]dtos.RoleInfo, len(roles)),
		Permissions: make([]dtos.PermissionInfo, 0),
	}

	// Mapear roles
	for i, role := range roles {
		response.Roles[i] = dtos.RoleInfo{
			ID:          role.ID,
			Name:        role.Name,
			Code:        role.Code,
			Description: role.Description,
			Level:       role.Level,
			IsSystem:    role.IsSystem,
			Scope:       role.ScopeName, // Usar ScopeName en lugar de Scope
		}
	}

	// Mapear permisos (eliminar duplicados)
	permissionMap := make(map[string]dtos.PermissionInfo)
	for _, permission := range allPermissions {
		key := permission.Code
		if _, exists := permissionMap[key]; !exists {
			permissionMap[key] = dtos.PermissionInfo{
				ID:          permission.ID,
				Name:        permission.Name,
				Code:        permission.Code,
				Description: permission.Description,
				Resource:    permission.Resource,
				Action:      permission.Action,
				Scope:       permission.ScopeName, // Usar ScopeName en lugar de Scope
			}
		}
	}

	// Convertir map a slice
	for _, permission := range permissionMap {
		response.Permissions = append(response.Permissions, permission)
	}

	uc.log.Info().
		Uint("user_id", userID).
		Int("roles_count", len(roles)).
		Int("permissions_count", len(response.Permissions)).
		Bool("is_super", isSuper).
		Msg("Roles y permisos obtenidos exitosamente")

	return response, nil
}
