package request

import "mime/multipart"

// CreateUserRequest representa la solicitud para crear un usuario
type CreateUserRequest struct {
	Name        string                `form:"name" binding:"required,min=2,max=100"`
	Email       string                `form:"email" binding:"required,email"`
	Phone       string                `form:"phone" binding:"omitempty,len=10"`
	AvatarURL   string                `form:"avatar_url" binding:"omitempty,url"`
	AvatarFile  *multipart.FileHeader `form:"avatarFile"`
	IsActive    bool                  `form:"is_active"`
	RoleIDs     string                `form:"role_ids" binding:"omitempty"`     // IDs separados por comas
	BusinessIDs string                `form:"business_ids" binding:"omitempty"` // IDs separados por comas
}
