package businesshandler

import (
	"central_reserve/internal/infra/primary/http2/handlers/businesshandler/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetBusinessResourcesHandler obtiene todos los recursos configurados de un negocio
// @Summary Obtener recursos del negocio
// @Description Obtiene todos los recursos permitidos y configurados para un negocio específico, incluyendo su estado de activación
// @Tags Business Resources
// @Accept json
// @Produce json
// @Param id path int true "ID del negocio" minimum(1)
// @Success 200 {object}  map[string]interface{}  "Recursos obtenidos exitosamente"
// @Failure 400 {object}  map[string]interface{}  "ID de negocio inválido"
// @Failure 401 {object}  map[string]interface{}  "No autorizado"
// @Failure 500 {object}  map[string]interface{}  "Error interno del servidor"
// @Router /businesses/{id}/resources [get]
// @Security BearerAuth
func (h *BusinessHandler) GetBusinessResourcesHandler(c *gin.Context) {
	// Obtener el ID del negocio de los parámetros de la URL
	businessIDStr := c.Param("id")
	businessID, err := strconv.ParseUint(businessIDStr, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Str("business_id", businessIDStr).Msg("Error al parsear ID del negocio")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Error:   "ID de negocio inválido",
			Message: "El ID del negocio debe ser un número válido",
		})
		return
	}

	// Obtener recursos del negocio usando el caso de uso
	resources, err := h.usecase.GetBusinessResources(c.Request.Context(), uint(businessID))
	if err != nil {
		h.logger.Error().Err(err).Uint("business_id", uint(businessID)).Msg("Error al obtener recursos del negocio")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Error:   "Error interno del servidor",
			Message: "No se pudieron obtener los recursos del negocio",
		})
		return
	}

	// Construir respuesta exitosa
	responseData := response.BusinessResourcesResponse{
		BusinessID: resources.BusinessID,
		Resources:  make([]response.BusinessResourceConfiguredResponse, len(resources.Resources)),
		Total:      resources.Total,
		Active:     resources.Active,
		Inactive:   resources.Inactive,
	}

	// Mapear recursos a la respuesta
	for i, resource := range resources.Resources {
		responseData.Resources[i] = response.BusinessResourceConfiguredResponse{
			ResourceID:   resource.ResourceID,
			ResourceName: resource.ResourceName,
			IsActive:     resource.IsActive,
		}
	}

	c.JSON(http.StatusOK, response.GetBusinessResourcesResponse{
		Success: true,
		Message: "Recursos del negocio obtenidos exitosamente",
		Data:    responseData,
	})

	h.logger.Info().
		Uint("business_id", uint(businessID)).
		Int("total_resources", resources.Total).
		Int("active_resources", resources.Active).
		Int("inactive_resources", resources.Inactive).
		Msg("Recursos del negocio obtenidos exitosamente")
}

// GetBusinessResourceStatusHandler obtiene el estado de un recurso específico del negocio
// @Summary Obtener estado de un recurso específico
// @Description Obtiene el estado de activación de un recurso específico para un negocio
// @Tags Business Resources
// @Accept json
// @Produce json
// @Param id path int true "ID del negocio" minimum(1)
// @Param resource path string true "Nombre del recurso" example("users")
// @Success 200 {object}  map[string]interface{}  "Estado del recurso obtenido exitosamente"
// @Failure 400 {object}  map[string]interface{}  "Parámetros inválidos"
// @Failure 401 {object}  map[string]interface{}  "No autorizado"
// @Failure 404 {object}  map[string]interface{}  "Recurso no encontrado"
// @Failure 500 {object}  map[string]interface{}  "Error interno del servidor"
// @Router /businesses/{id}/resources/{resource} [get]
// @Security BearerAuth
func (h *BusinessHandler) GetBusinessResourceStatusHandler(c *gin.Context) {
	// Obtener el ID del negocio de los parámetros de la URL
	businessIDStr := c.Param("id")
	businessID, err := strconv.ParseUint(businessIDStr, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Str("business_id", businessIDStr).Msg("Error al parsear ID del negocio")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Error:   "ID de negocio inválido",
			Message: "El ID del negocio debe ser un número válido",
		})
		return
	}

	// Obtener el nombre del recurso de los parámetros de la URL
	resourceName := c.Param("resource")
	if resourceName == "" {
		h.logger.Error().Msg("Nombre del recurso no proporcionado")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Error:   "Nombre de recurso requerido",
			Message: "Debe proporcionar el nombre del recurso",
		})
		return
	}

	// Obtener estado del recurso usando el caso de uso
	resourceStatus, err := h.usecase.GetBusinessResourceStatus(c.Request.Context(), uint(businessID), resourceName)
	if err != nil {
		h.logger.Error().Err(err).
			Uint("business_id", uint(businessID)).
			Str("resource_name", resourceName).
			Msg("Error al obtener estado del recurso")

		// Si el recurso no existe, retornar 404
		if err.Error() == "recurso '"+resourceName+"' no encontrado para el negocio" {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Error:   "Recurso no encontrado",
				Message: "El recurso especificado no existe para este negocio",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Error:   "Error interno del servidor",
			Message: "No se pudo obtener el estado del recurso",
		})
		return
	}

	// Construir respuesta exitosa
	responseData := response.BusinessResourceConfiguredResponse{
		ResourceID:   resourceStatus.ResourceID,
		ResourceName: resourceStatus.ResourceName,
		IsActive:     resourceStatus.IsActive,
	}

	c.JSON(http.StatusOK, response.GetBusinessResourceStatusResponse{
		Success: true,
		Message: "Estado del recurso obtenido exitosamente",
		Data:    responseData,
	})

	h.logger.Info().
		Uint("business_id", uint(businessID)).
		Str("resource_name", resourceName).
		Bool("is_active", resourceStatus.IsActive).
		Msg("Estado del recurso obtenido exitosamente")
}
