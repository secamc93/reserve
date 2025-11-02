package usecaseauth

import (
	"central_reserve/services/auth/internal/domain"
	"context"
	"fmt"
)

// GetUserRolesPermissions maneja la lógica para obtener roles y permisos del usuario
func (uc *AuthUseCase) GetUserRolesPermissions(ctx context.Context, userID uint, businessID uint, token string) (*domain.UserRolesPermissionsResponse, error) {
	uc.log.Info().Uint("user_id", userID).Uint("business_id", businessID).Msg("Obteniendo roles y permisos del usuario")

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
	user, err := uc.repository.GetUserByID(ctx, claims.UserID)
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

	// Verificar si es super admin (tiene rol super_admin)
	isSuper := false
	for _, role := range roles {
		if role.Name == "Super Administrador" {
			isSuper = true
			break
		}
	}

	// Si es super admin y businessID es 0, saltarse validaciones de business
	var business *domain.BusinessInfo
	var businessType *domain.BusinessTypeInfo
	var activeResourcesMap map[uint]bool

	if businessID == 0 {
		// Super admin sin business específico
		activeResourcesMap = make(map[uint]bool)
	} else {
		// Validar business para usuarios normales
		business, err = uc.repository.GetBusinessByID(ctx, businessID)
		if err != nil {
			uc.log.Error().Err(err).Uint("business_id", businessID).Msg("Error al obtener información del business")
			return nil, fmt.Errorf("error interno del servidor")
		}

		if business == nil {
			uc.log.Error().Uint("business_id", businessID).Msg("Business no encontrado")
			return nil, fmt.Errorf("business no encontrado")
		}

		// Obtener información del tipo de business
		businessType, err = uc.repository.GetBusinessTypeByID(ctx, business.BusinessTypeID)
		if err != nil {
			uc.log.Error().Err(err).Uint("business_type_id", business.BusinessTypeID).Msg("Error al obtener información del tipo de business")
			return nil, fmt.Errorf("error interno del servidor")
		}

		if businessType == nil {
			uc.log.Error().Uint("business_type_id", business.BusinessTypeID).Msg("Tipo de business no encontrado")
			return nil, fmt.Errorf("tipo de business no encontrado")
		}

		// Obtener recursos configurados para el business
		businessResourcesIDs, err := uc.repository.GetBusinessConfiguredResourcesIDs(ctx, businessID)
		if err != nil {
			uc.log.Error().Err(err).Uint("business_id", businessID).Msg("Error al obtener recursos configurados del business")
			return nil, fmt.Errorf("error interno del servidor")
		}

		// Crear mapa de recursos activos para búsqueda rápida
		activeResourcesMap = make(map[uint]bool)
		for _, resourceID := range businessResourcesIDs {
			activeResourcesMap[resourceID] = true
		}
	}

	// Obtener permisos de todos los roles del usuario
	var allPermissions []domain.Permission
	for _, role := range roles {
		permissions, err := uc.repository.GetRolePermissions(ctx, role.ID)
		if err != nil {
			uc.log.Error().Err(err).Uint("role_id", role.ID).Msg("Error al obtener permisos del rol")
			continue
		}
		allPermissions = append(allPermissions, permissions...)
	}

	// Construir respuesta
	response := &domain.UserRolesPermissionsResponse{
		Success:     true,
		Message:     "Roles y permisos obtenidos exitosamente",
		UserID:      userID,
		Email:       user.Email,
		IsSuper:     isSuper,
		Role:        domain.RoleInfo{}, // Se llenará después
		Permissions: make([]domain.PermissionInfo, 0),
	}

	// Setear campos de business solo si existe
	if business != nil && businessType != nil {
		response.BusinessID = business.ID
		response.BusinessName = business.Name
		response.BusinessTypeID = businessType.ID
		response.BusinessTypeName = businessType.Name
	}

	// Mapear el primer rol (ya que ahora solo hay uno por business)
	if len(roles) > 0 {
		response.Role = domain.RoleInfo{
			ID:          roles[0].ID,
			Name:        roles[0].Name,
			Description: roles[0].Description,
			Level:       roles[0].Level,
			IsSystem:    roles[0].IsSystem,
			Scope:       roles[0].ScopeName,
		}
	}

	// Mapear permisos (eliminar duplicados) y verificar si están activos para el business
	permissionMap := make(map[string]domain.PermissionInfo)
	for _, permission := range allPermissions {
		key := permission.Resource + ":" + permission.Action
		if _, exists := permissionMap[key]; !exists {
			// Verificar si el recurso está configurado para el business
			isActive := activeResourcesMap[permission.ResourceID]

			permissionMap[key] = domain.PermissionInfo{
				ID:          permission.ID,
				Description: permission.Description,
				Resource:    permission.Resource,
				Action:      permission.Action,
				Active:      isActive,
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
