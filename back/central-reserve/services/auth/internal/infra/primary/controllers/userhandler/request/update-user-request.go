package request

import "mime/multipart"

// UpdateUserRequest representa la solicitud para actualizar un usuario
type UpdateUserRequest struct {
	Name        string                `form:"name" binding:"omitempty,min=2,max=100"`
	Email       string                `form:"email" binding:"omitempty,email"`
	Password    string                `form:"password" binding:"omitempty,min=6,max=100"`
	Phone       string                `form:"phone" binding:"omitempty,len=10"`
	AvatarURL   string                `form:"avatar_url" binding:"omitempty,url"`
	AvatarFile  *multipart.FileHeader `form:"avatarFile"`
	IsActive    bool                  `form:"is_active"`
	RoleIDs     string                `form:"role_ids" binding:"omitempty"`     // IDs separados por comas
	BusinessIDs string                `form:"business_ids" binding:"omitempty"` // IDs separados por comas
}
