package response

// SuccessResponse representa una respuesta exitosa genérica
type SuccessResponse struct {
	Success bool        `json:"success" example:"true"`
	Message string      `json:"message" example:"Operación exitosa"`
	Data    interface{} `json:"data,omitempty"`
}

// BusinessTypeResourcesSuccessResponse representa una respuesta exitosa para recursos de tipos de negocio
type BusinessTypeResourcesSuccessResponse struct {
	Success bool                          `json:"success" example:"true"`
	Message string                        `json:"message" example:"Recursos obtenidos exitosamente"`
	Data    BusinessTypeResourcesResponse `json:"data"`
}

// UpdateResourcesSuccessResponse representa una respuesta exitosa para actualización de recursos
type UpdateResourcesSuccessResponse struct {
	Success bool                        `json:"success" example:"true"`
	Message string                      `json:"message" example:"Recursos actualizados exitosamente"`
	Data    UpdateResourcesDataResponse `json:"data"`
}

// UpdateResourcesDataResponse contiene los datos de la respuesta de actualización
type UpdateResourcesDataResponse struct {
	BusinessTypeID uint   `json:"business_type_id" example:"1"`
	ResourcesCount int    `json:"resources_count" example:"3"`
	UpdatedAt      string `json:"updated_at" example:"2025-01-17T10:30:00Z"`
}

// BusinessTypesWithResourcesPaginatedSuccessResponse representa la respuesta exitosa paginada
type BusinessTypesWithResourcesPaginatedSuccessResponse struct {
	Success bool                                        `json:"success" example:"true"`
	Message string                                      `json:"message" example:"Tipos de negocio con recursos obtenidos exitosamente"`
	Data    BusinessTypesWithResourcesPaginatedResponse `json:"data"`
}

// BusinessTypesWithResourcesPaginatedResponse representa los datos paginados
type BusinessTypesWithResourcesPaginatedResponse struct {
	BusinessTypes []BusinessTypeWithResourcesResponse `json:"business_types"`
	Pagination    PaginationResponse                  `json:"pagination"`
}

// BusinessTypeWithResourcesResponse representa un tipo de negocio con sus recursos
type BusinessTypeWithResourcesResponse struct {
	ID        uint                                    `json:"id" example:"1"`
	Name      string                                  `json:"name" example:"Restaurante"`
	Resources []BusinessTypeResourcePermittedResponse `json:"resources"`
	CreatedAt string                                  `json:"created_at" example:"2025-01-17T10:30:00Z"`
	UpdatedAt string                                  `json:"updated_at" example:"2025-01-17T10:30:00Z"`
}

// PaginationResponse representa la información de paginación
type PaginationResponse struct {
	CurrentPage int   `json:"current_page" example:"1"`
	PerPage     int   `json:"per_page" example:"10"`
	Total       int64 `json:"total" example:"25"`
	LastPage    int   `json:"last_page" example:"3"`
	HasNext     bool  `json:"has_next" example:"true"`
	HasPrev     bool  `json:"has_prev" example:"false"`
}
