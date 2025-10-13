package businesresourcehandler

import (
	"net/http"
	"strconv"

	"central_reserve/services/business/internal/domain"
	"central_reserve/services/business/internal/infra/primary/controllers/businesresourcehandler/mappers"
	"central_reserve/services/business/internal/infra/primary/controllers/businesresourcehandler/request"

	"github.com/gin-gonic/gin"
)

// UpdateBusinessTypeResources actualiza los recursos permitidos para un tipo de negocio
//
//	@Summary		Actualizar recursos de un tipo de negocio
//	@Description	Actualiza la lista de recursos permitidos para un tipo de negocio específico
//	@Tags			Business Resources
//	@Accept			json
//	@Produce		json
//	@Param			business_type_id	path		int							true	"ID del tipo de negocio"
//	@Param			request				body		object{resources_ids=[]int}	true	"Lista de IDs de recursos"
//	@Success		201					{object}	map[string]interface{}		"Tipo de negocio creado exitosamente"
//	@Failure		400					{object}	map[string]interface{}		"Solicitud inválida"
//	@Failure		401					{object}	map[string]interface{}		"Token de acceso requerido"
//	@Failure		500					{object}	map[string]interface{}		"Error interno del servidor"
//	@Security		BearerAuth
//	@Router			/business-resources/{business_type_id}/resources [put]
func (h *businessResourceHandler) UpdateBusinessTypeResources(c *gin.Context) {
	// Obtener el ID del tipo de negocio desde los parámetros de la URL
	businessTypeIDStr := c.Param("business_type_id")
	businessTypeID, err := strconv.ParseUint(businessTypeIDStr, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Str("business_type_id", businessTypeIDStr).Msg("ID de tipo de negocio inválido")
		c.JSON(http.StatusBadRequest, mappers.ToErrorResponse(err, "ID de tipo de negocio inválido"))
		return
	}

	// Bind de la request
	var req request.UpdateBusinessTypeResourcesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error al hacer bind de la request")
		c.JSON(http.StatusBadRequest, mappers.ToErrorResponse(err, "Datos de entrada inválidos"))
		return
	}

	h.logger.Info().Uint64("business_type_id", businessTypeID).Int("resources_count", len(req.ResourcesIDs)).Msg("Actualizando recursos del tipo de negocio")

	// Convertir la request al dominio
	domainRequest := domain.UpdateBusinessTypeResourcesRequest{
		ResourcesIDs: req.ResourcesIDs,
	}

	// Llamar al caso de uso
	err = h.businessTypeResourceUseCase.UpdateBusinessTypeResources(c.Request.Context(), uint(businessTypeID), domainRequest)
	if err != nil {
		h.logger.Error().Err(err).Uint64("business_type_id", businessTypeID).Msg("Error al actualizar recursos del tipo de negocio")

		// Determinar el código de estado HTTP según el tipo de error
		statusCode := http.StatusInternalServerError
		message := "Error interno del servidor"

		if err.Error() == "tipo de negocio no encontrado" {
			statusCode = http.StatusNotFound
			message = "Tipo de negocio no encontrado"
		} else if err.Error() == "no se permiten IDs de recursos duplicados" {
			statusCode = http.StatusBadRequest
			message = "Datos de entrada inválidos"
		}

		c.JSON(statusCode, mappers.ToErrorResponse(err, message))
		return
	}

	h.logger.Info().Uint64("business_type_id", businessTypeID).Int("resources_count", len(req.ResourcesIDs)).Msg("Recursos del tipo de negocio actualizados exitosamente")

	// Mapear la respuesta exitosa
	responseData := mappers.ToUpdateResourcesSuccessResponse(uint(businessTypeID), len(req.ResourcesIDs))

	c.JSON(http.StatusOK, responseData)
}
