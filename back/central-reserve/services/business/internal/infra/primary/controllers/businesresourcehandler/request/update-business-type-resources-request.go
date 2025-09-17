package request

// UpdateBusinessTypeResourcesRequest representa la solicitud para actualizar recursos permitidos de un tipo de negocio
type UpdateBusinessTypeResourcesRequest struct {
	ResourcesIDs []uint `json:"resources_ids" binding:"required" example:"[1,2,3]"`
}
