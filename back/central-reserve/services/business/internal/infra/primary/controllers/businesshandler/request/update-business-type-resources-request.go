package request

// UpdateBusinessTypeResourcesRequest representa la solicitud para actualizar recursos permitidos de un tipo de negocio
//
//	@Description	Actualizar recursos permitidos - FORMATO SIMPLE: Use solo el campo 'resources_ids' con una lista de números (IDs de recursos). Ejemplo: {"resources_ids": [1, 2, 3]}
type UpdateBusinessTypeResourcesRequest struct {
	ResourcesIDs []uint `json:"resources_ids" binding:"required" example:"[1,2,3]" description:"Lista de IDs de recursos que estarán permitidos para este tipo de negocio. Ejemplo: [1,2,3] significa que los recursos con ID 1, 2 y 3 estarán permitidos"`
}
