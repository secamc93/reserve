package businesresourcehandler

import (
	"net/http"
	"strconv"

	"central_reserve/services/business/internal/domain"
	"central_reserve/services/business/internal/infra/primary/controllers/businesresourcehandler/mappers"
	"central_reserve/services/business/internal/infra/primary/controllers/businesresourcehandler/request"

	"github.com/gin-gonic/gin"
)

// UpdateBusinessConfiguredResources actualiza los recursos configurados para un business específico
//
//	@Summary		Actualizar recursos configurados de un business
//	@Description	Actualiza la lista de recursos configurados para un business específico (solo recursos permitidos por su tipo)
//	@Tags			Business Resources
//	@Accept			json
//	@Produce		json
//	@Param			business_id	path	int							true	"ID del business"
//	@Param			request		body	object{resources_ids=[]int}	true	"Lista de IDs de recursos"
//	@Security		BearerAuth
//	@Success		200	{object}	map[string]interface{}	"Recursos configurados actualizados exitosamente"
//	@Failure		400	{object}	map[string]interface{}	"Parámetros inválidos o recursos no permitidos"
//	@Failure		404	{object}	map[string]interface{}	"Business no encontrado"
//	@Failure		500	{object}	map[string]interface{}	"Error interno del servidor"
//	@Router			/business-resources/businesses/{business_id}/configured-resources [put]
func (h *businessResourceHandler) UpdateBusinessConfiguredResources(c *gin.Context) {
	// Obtener el ID del business desde los parámetros de la URL
	businessIDStr := c.Param("business_id")
	businessID, err := strconv.ParseUint(businessIDStr, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Str("business_id", businessIDStr).Msg("ID de business inválido")
		c.JSON(http.StatusBadRequest, mappers.ToErrorResponse(err, "ID de business inválido"))
		return
	}

	// Bind de la request
	var req request.UpdateBusinessTypeResourcesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error al hacer bind de la request")
		c.JSON(http.StatusBadRequest, mappers.ToErrorResponse(err, "Datos de entrada inválidos"))
		return
	}

	h.logger.Info().Uint64("business_id", businessID).Int("resources_count", len(req.ResourcesIDs)).Msg("Actualizando recursos configurados del business")

	// Convertir la request al dominio
	domainRequest := domain.UpdateBusinessTypeResourcesRequest{
		ResourcesIDs: req.ResourcesIDs,
	}

	// Llamar al caso de uso
	err = h.businessTypeResourceUseCase.UpdateBusinessConfiguredResources(c.Request.Context(), uint(businessID), domainRequest)
	if err != nil {
		h.logger.Error().Err(err).Uint64("business_id", businessID).Msg("Error al actualizar recursos configurados del business")

		// Determinar el código de estado HTTP según el tipo de error
		statusCode := http.StatusInternalServerError
		message := "Error interno del servidor"

		if err.Error() == "business no encontrado" {
			statusCode = http.StatusNotFound
			message = "Business no encontrado"
		} else if err.Error() == "algunos recursos no están permitidos para este tipo de business" || err.Error() == "no se permiten IDs de recursos duplicados" {
			statusCode = http.StatusBadRequest
			message = "Datos de entrada inválidos"
		}

		c.JSON(statusCode, mappers.ToErrorResponse(err, message))
		return
	}

	h.logger.Info().Uint64("business_id", businessID).Int("resources_count", len(req.ResourcesIDs)).Msg("Recursos configurados del business actualizados exitosamente")

	// Mapear la respuesta exitosa
	responseData := mappers.ToUpdateBusinessConfiguredResourcesSuccessResponse(uint(businessID), len(req.ResourcesIDs))

	c.JSON(http.StatusOK, responseData)
}
