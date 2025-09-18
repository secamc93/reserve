package mapper

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/primary/controllers/userhandler/request"
	"central_reserve/services/auth/internal/infra/primary/controllers/userhandler/response"
	"strconv"
	"strings"
)

// ToUserFilters convierte GetUsersRequest a UserFilters del dominio
func ToUserFilters(req request.GetUsersRequest) domain.UserFilters {
	// Parsear user_ids desde string separado por comas
	var userIDs []uint
	if req.UserIDs != "" {
		userIDsStr := strings.Split(req.UserIDs, ",")
		for _, idStr := range userIDsStr {
			idStr = strings.TrimSpace(idStr)
			if idStr != "" {
				if id, err := strconv.ParseUint(idStr, 10, 32); err == nil {
					userIDs = append(userIDs, uint(id))
				}
			}
		}
	}

	return domain.UserFilters{
		Page:       req.Page,
		PageSize:   req.PageSize,
		Name:       req.Name,
		Email:      req.Email,
		Phone:      req.Phone,
		UserIDs:    userIDs,
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
	// Parsear role_ids desde string separado por comas
	var roleIDs []uint
	if req.RoleIDs != "" {
		roleIDsStr := strings.Split(req.RoleIDs, ",")
		for _, idStr := range roleIDsStr {
			idStr = strings.TrimSpace(idStr)
			if idStr != "" {
				if id, err := strconv.ParseUint(idStr, 10, 32); err == nil {
					roleIDs = append(roleIDs, uint(id))
				}
			}
		}
	}

	// Parsear business_ids desde string separado por comas
	var businessIDs []uint
	if req.BusinessIDs != "" {
		businessIDsStr := strings.Split(req.BusinessIDs, ",")
		for _, idStr := range businessIDsStr {
			idStr = strings.TrimSpace(idStr)
			if idStr != "" {
				if id, err := strconv.ParseUint(idStr, 10, 32); err == nil {
					businessIDs = append(businessIDs, uint(id))
				}
			}
		}
	}

	return domain.CreateUserDTO{
		Name:        req.Name,
		Email:       req.Email,
		Phone:       req.Phone,
		AvatarURL:   req.AvatarURL,
		AvatarFile:  req.AvatarFile,
		IsActive:    req.IsActive,
		RoleIDs:     roleIDs,
		BusinessIDs: businessIDs,
	}
}

// ToUpdateUserDTO convierte UpdateUserRequest a UpdateUserDTO del dominio
func ToUpdateUserDTO(req request.UpdateUserRequest) domain.UpdateUserDTO {
	// Parsear role_ids desde string separado por comas
	var roleIDs []uint
	if req.RoleIDs != "" {
		roleIDsStr := strings.Split(req.RoleIDs, ",")
		for _, idStr := range roleIDsStr {
			idStr = strings.TrimSpace(idStr)
			if idStr != "" {
				if id, err := strconv.ParseUint(idStr, 10, 32); err == nil {
					roleIDs = append(roleIDs, uint(id))
				}
			}
		}
	}

	// Parsear business_ids desde string separado por comas
	var businessIDs []uint
	if req.BusinessIDs != "" {
		businessIDsStr := strings.Split(req.BusinessIDs, ",")
		for _, idStr := range businessIDsStr {
			idStr = strings.TrimSpace(idStr)
			if idStr != "" {
				if id, err := strconv.ParseUint(idStr, 10, 32); err == nil {
					businessIDs = append(businessIDs, uint(id))
				}
			}
		}
	}

	return domain.UpdateUserDTO{
		Name:        req.Name,
		Email:       req.Email,
		Password:    req.Password,
		Phone:       req.Phone,
		AvatarURL:   req.AvatarURL,
		AvatarFile:  req.AvatarFile,
		IsActive:    req.IsActive,
		RoleIDs:     roleIDs,
		BusinessIDs: businessIDs,
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
		}
	}

	businesses := make([]response.BusinessInfo, len(dto.Businesses))
	for i, business := range dto.Businesses {
		businesses[i] = response.BusinessInfo{
			ID:               business.ID,
			Name:             business.Name,
			LogoURL:          business.LogoURL,
			BusinessTypeID:   business.BusinessTypeID,
			BusinessTypeName: business.BusinessTypeName,
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
