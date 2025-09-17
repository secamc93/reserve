package response

// BusinessTypeResourcePermittedResponse representa la respuesta de un recurso permitido para un tipo de negocio
type BusinessTypeResourcePermittedResponse struct {
	ID           uint   `json:"id" example:"1"`
	ResourceID   uint   `json:"resource_id" example:"1"`
	ResourceName string `json:"resource_name" example:"Reservas"`
}

// BusinessTypeResourcesResponse representa la respuesta completa de recursos permitidos para un tipo de negocio
type BusinessTypeResourcesResponse struct {
	BusinessTypeID uint                                    `json:"business_type_id" example:"1"`
	Resources      []BusinessTypeResourcePermittedResponse `json:"resources"`
	Total          int                                     `json:"total" example:"5"`
	Active         int                                     `json:"active" example:"4"`
	Inactive       int                                     `json:"inactive" example:"1"`
}

// ErrorResponse representa una respuesta de error
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Message string `json:"message"`
}
