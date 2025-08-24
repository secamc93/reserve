package mapper

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/infra/primary/http2/handlers/authhandler/response"
)

// ToLoginResponse convierte el dominio LoginResponse a response.LoginResponse
func ToLoginResponse(domainResponse *dtos.LoginResponse) *response.LoginResponse {
	if domainResponse == nil {
		return nil
	}

	// Convertir businesses
	businesses := make([]response.BusinessInfo, len(domainResponse.Businesses))
	for i, business := range domainResponse.Businesses {
		businesses[i] = response.BusinessInfo{
			ID:             business.ID,
			Name:           business.Name,
			Code:           business.Code,
			BusinessTypeID: business.BusinessTypeID,
			BusinessType: response.BusinessTypeInfo{
				ID:          business.BusinessType.ID,
				Name:        business.BusinessType.Name,
				Code:        business.BusinessType.Code,
				Description: business.BusinessType.Description,
				Icon:        business.BusinessType.Icon,
			},
			Timezone:           business.Timezone,
			Address:            business.Address,
			Description:        business.Description,
			LogoURL:            business.LogoURL,
			PrimaryColor:       business.PrimaryColor,
			SecondaryColor:     business.SecondaryColor,
			TertiaryColor:      business.TertiaryColor,
			QuaternaryColor:    business.QuaternaryColor,
			NavbarImageURL:     business.NavbarImageURL,
			CustomDomain:       business.CustomDomain,
			IsActive:           business.IsActive,
			EnableDelivery:     business.EnableDelivery,
			EnablePickup:       business.EnablePickup,
			EnableReservations: business.EnableReservations,
		}
	}

	return &response.LoginResponse{
		User: response.UserInfo{
			ID:          domainResponse.User.ID,
			Name:        domainResponse.User.Name,
			Email:       domainResponse.User.Email,
			Phone:       domainResponse.User.Phone,
			AvatarURL:   domainResponse.User.AvatarURL,
			IsActive:    domainResponse.User.IsActive,
			LastLoginAt: domainResponse.User.LastLoginAt,
		},
		Token:                 domainResponse.Token,
		RequirePasswordChange: domainResponse.RequirePasswordChange,
		Businesses:            businesses,
	}
}

// ToUserRolesPermissionsResponse convierte el dominio UserRolesPermissionsResponse a response.UserRolesPermissionsResponse
func ToUserRolesPermissionsResponse(domainResponse *dtos.UserRolesPermissionsResponse) response.UserRolesPermissionsResponse {
	if domainResponse == nil {
		return response.UserRolesPermissionsResponse{}
	}

	resources := groupPermissionsByResource(domainResponse.Permissions)

	return response.UserRolesPermissionsResponse{
		IsSuper:   domainResponse.IsSuper,
		Roles:     toRoleInfoSlice(domainResponse.Roles),
		Resources: resources, // Nuevo: permisos agrupados por recurso
	}
}

// toRoleInfoSlice convierte un slice de dtos.RoleInfo a response.RoleInfo
func toRoleInfoSlice(domainRoles []dtos.RoleInfo) []response.RoleInfo {
	if domainRoles == nil {
		return nil
	}

	roles := make([]response.RoleInfo, len(domainRoles))
	for i, role := range domainRoles {
		roles[i] = response.RoleInfo{
			ID:          role.ID,
			Name:        role.Name,
			Description: role.Description,
		}
	}
	return roles
}

// groupPermissionsByResource agrupa los permisos por recurso
func groupPermissionsByResource(permissions []dtos.PermissionInfo) []response.ResourcePermissions {
	if permissions == nil {
		return nil
	}

	// Mapa para agrupar permisos por recurso
	resourceMap := make(map[string][]string)

	// Agrupar permisos por recurso
	for _, permission := range permissions {
		resourceMap[permission.Resource] = append(resourceMap[permission.Resource], permission.Action)
	}

	// Convertir el mapa a slice de ResourcePermissions
	var resources []response.ResourcePermissions
	for resource, actions := range resourceMap {
		resources = append(resources, response.ResourcePermissions{
			Resource: resource,
			Actions:  actions,
		})
	}

	return resources
}
