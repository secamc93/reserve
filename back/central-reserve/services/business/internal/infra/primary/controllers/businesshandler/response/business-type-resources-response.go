package response

// BusinessTypeResourcePermittedResponse representa un recurso permitido para un tipo de negocio
// @Description Información detallada de un recurso permitido para un tipo de negocio
type BusinessTypeResourcePermittedResponse struct {
	ID             uint   `json:"id" example:"1" description:"ID único del registro"`
	BusinessTypeID uint   `json:"business_type_id" example:"1" description:"ID del tipo de negocio"`
	ResourceID     uint   `json:"resource_id" example:"1" description:"ID único del recurso"`
	ResourceName   string `json:"resource_name" example:"users" description:"Nombre del recurso"`
	ResourceCode   string `json:"resource_code" example:"USR" description:"Código del recurso"`
	IsActive       bool   `json:"is_active" example:"true" description:"Indica si el recurso está activo"`
}

// BusinessTypeResourcesResponse representa la respuesta completa de recursos permitidos para un tipo de negocio
// @Description Lista completa de recursos permitidos para un tipo de negocio con estadísticas
type BusinessTypeResourcesResponse struct {
	BusinessTypeID uint                                    `json:"business_type_id" example:"1" description:"ID del tipo de negocio"`
	Resources      []BusinessTypeResourcePermittedResponse `json:"resources" description:"Lista de recursos permitidos"`
	Total          int                                     `json:"total" example:"5" description:"Total de recursos disponibles"`
	Active         int                                     `json:"active" example:"3" description:"Número de recursos activos"`
	Inactive       int                                     `json:"inactive" example:"2" description:"Número de recursos inactivos"`
}

// GetBusinessTypeResourcesResponse representa la respuesta para obtener recursos permitidos de un tipo de negocio
// @Description Respuesta exitosa al obtener recursos permitidos de un tipo de negocio
type GetBusinessTypeResourcesResponse struct {
	Success bool                          `json:"success" example:"true" description:"Indica si la operación fue exitosa"`
	Message string                        `json:"message" example:"Recursos permitidos obtenidos exitosamente" description:"Mensaje descriptivo de la operación"`
	Data    BusinessTypeResourcesResponse `json:"data" description:"Datos de los recursos permitidos"`
}

// UpdateBusinessTypeResourcesResponse representa la respuesta para actualizar recursos permitidos
// @Description Respuesta exitosa al actualizar recursos permitidos de un tipo de negocio
type UpdateBusinessTypeResourcesResponse struct {
	Success bool   `json:"success" example:"true" description:"Indica si la operación fue exitosa"`
	Message string `json:"message" example:"Recursos permitidos actualizados exitosamente" description:"Mensaje descriptivo de la operación"`
}

