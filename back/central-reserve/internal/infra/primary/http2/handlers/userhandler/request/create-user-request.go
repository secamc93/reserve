package request

// CreateUserRequest representa la solicitud para crear un usuario
type CreateUserRequest struct {
	Name        string `json:"name" binding:"required,min=2,max=100"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6,max=100"`
	Phone       string `json:"phone" binding:"omitempty,len=10"`
	AvatarURL   string `json:"avatar_url" binding:"omitempty,url"`
	IsActive    bool   `json:"is_active"`
	RoleIDs     []uint `json:"role_ids" binding:"omitempty,dive,min=1"`
	BusinessIDs []uint `json:"business_ids" binding:"omitempty,dive,min=1"`
}
