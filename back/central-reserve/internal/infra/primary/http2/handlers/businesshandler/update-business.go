package businesshandler

import (
	"net/http"
	"strconv"

	"central_reserve/internal/infra/primary/http2/handlers/businesshandler/mapper"
	"central_reserve/internal/infra/primary/http2/handlers/businesshandler/request"

	"github.com/gin-gonic/gin"
)

// UpdateBusiness godoc
// @Summary Actualizar negocio
// @Description Actualiza un negocio existente
// @Tags businesses
// @Accept multipart/form-data
// @Produce json
// @Security     BearerAuth
// @Param id path int true "ID del negocio"
// @Param name formData string false "Nombre del negocio"
// @Param code formData string false "Código del negocio"
// @Param business_type_id formData int false "ID del tipo de negocio"
// @Param timezone formData string false "Zona horaria"
// @Param address formData string false "Dirección"
// @Param description formData string false "Descripción"
// @Param logo_url formData string false "URL del logo"
// @Param primary_color formData string false "Color primario"
// @Param secondary_color formData string false "Color secundario"
// @Param custom_domain formData string false "Dominio personalizado"
// @Param is_active formData boolean false "¿Activo?"
// @Param enable_delivery formData boolean false "Habilitar delivery"
// @Param enable_pickup formData boolean false "Habilitar pickup"
// @Param enable_reservations formData boolean false "Habilitar reservas"
// @Success      201          {object}  map[string]interface{} "Negocio actualizado exitosamente"
// @Failure      400          {object}  map[string]interface{} "Solicitud inválida"
// @Failure      401          {object}  map[string]interface{} "Token de acceso requerido"
// @Failure      500          {object}  map[string]interface{} "Error interno del servidor"
// @Router /businesses/{id} [put]
func (h *BusinessHandler) UpdateBusinessHandler(c *gin.Context) {
	// Obtener ID del path
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, mapper.BuildErrorResponse("invalid_id", "ID de negocio inválido"))
		return
	}

	var updateRequest request.BusinessRequest

	// Validar y parsear el request
	if err := c.ShouldBind(&updateRequest); err != nil {
		c.JSON(http.StatusBadRequest, mapper.BuildErrorResponse("invalid_request", "Datos de entrada inválidos"))
		return
	}

	// Ejecutar caso de uso
	businessRequest := mapper.RequestToUpdateDTO(updateRequest)
	business, err := h.usecase.UpdateBusiness(c.Request.Context(), uint(id), businessRequest)
	if err != nil {
		if err.Error() == "negocio no encontrado" {
			c.JSON(http.StatusNotFound, mapper.BuildErrorResponse("not_found", "Negocio no encontrado"))
			return
		}
		h.logger.Error().Err(err).Uint("id", uint(id)).Msg("Error al actualizar negocio")
		c.JSON(http.StatusInternalServerError, mapper.BuildErrorResponse("internal_error", "Error interno del servidor"))
		return
	}

	// Construir respuesta exitosa
	response := mapper.BuildUpdateBusinessResponseFromDTO(business, "Negocio actualizado exitosamente")
	c.JSON(http.StatusOK, response)
}
