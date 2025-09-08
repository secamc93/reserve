package mapper

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/primary/controllers/userhandler/request"
	"central_reserve/services/auth/internal/infra/primary/controllers/userhandler/response"
)

// ToUserFilters convierte GetUsersRequest a UserFilters del dominio
func ToUserFilters(req request.GetUsersRequest) domain.UserFilters {
	return domain.UserFilters{
		Page:       req.Page,
		PageSize:   req.PageSize,
		Name:       req.Name,
		Email:      req.Email,
		Phone:      req.Phone,
		IsActive:   req.IsActive,
		RoleID:     req.RoleID,
		BusinessID: req.BusinessID,
		CreatedAt:  req.CreatedAt,
		SortBy:     req.SortBy,
		SortOrder:  req.SortOrder,
	}
}

// ToCreateUserDTO convierte CreateUserRequest a CreateUserDTO del dominio
func ToCreateUserDTO(req request.CreateUserRequest) domain.CreateUserDTO {
	return domain.CreateUserDTO{
		Name:        req.Name,
		Email:       req.Email,
		Phone:       req.Phone,
		AvatarURL:   req.AvatarURL,
		AvatarFile:  req.AvatarFile,
		IsActive:    req.IsActive,
		RoleIDs:     req.RoleIDs,
		BusinessIDs: req.BusinessIDs,
	}
}

// ToUpdateUserDTO convierte UpdateUserRequest a UpdateUserDTO del dominio
func ToUpdateUserDTO(req request.UpdateUserRequest) domain.UpdateUserDTO {
	return domain.UpdateUserDTO{
		Name:        req.Name,
		Email:       req.Email,
		Password:    req.Password,
		Phone:       req.Phone,
		AvatarURL:   req.AvatarURL,
		AvatarFile:  req.AvatarFile,
		IsActive:    req.IsActive,
		RoleIDs:     req.RoleIDs,
		BusinessIDs: req.BusinessIDs,
	}
}

// ToUserResponse convierte UserDTO a UserResponse
func ToUserResponse(dto domain.UserDTO) response.UserResponse {
	roles := make([]response.RoleInfo, len(dto.Roles))
	for i, role := range dto.Roles {
		roles[i] = response.RoleInfo{
			ID:          role.ID,
			Name:        role.Name,
			Description: role.Description,
			Level:       role.Level,
			IsSystem:    role.IsSystem,
			ScopeID:     role.ScopeID,
			ScopeName:   role.ScopeName,
			ScopeCode:   role.ScopeCode,
		}
	}

	businesses := make([]response.BusinessInfo, len(dto.Businesses))
	for i, business := range dto.Businesses {
		businesses[i] = response.BusinessInfo{
			ID:                 business.ID,
			Name:               business.Name,
			Code:               business.Code,
			BusinessTypeID:     business.BusinessTypeID,
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
			BusinessTypeName:   business.BusinessTypeName,
			BusinessTypeCode:   business.BusinessTypeCode,
		}
	}

	return response.UserResponse{
		ID:          dto.ID,
		Name:        dto.Name,
		Email:       dto.Email,
		Phone:       dto.Phone,
		AvatarURL:   dto.AvatarURL,
		IsActive:    dto.IsActive,
		LastLoginAt: dto.LastLoginAt,
		Roles:       roles,
		Businesses:  businesses,
		CreatedAt:   dto.CreatedAt,
		UpdatedAt:   dto.UpdatedAt,
	}
}

// ToUserListResponse convierte un UserListDTO a UserListResponse
func ToUserListResponse(userListDTO *domain.UserListDTO) response.UserListResponse {
	userResponses := make([]response.UserResponse, len(userListDTO.Users))
	for i, user := range userListDTO.Users {
		userResponses[i] = ToUserResponse(user)
	}

	return response.UserListResponse{
		Success: true,
		Data:    userResponses,
		Count:   int(userListDTO.Total),
	}
}
