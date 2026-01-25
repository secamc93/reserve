package businesshandler

import (
	"central_reserve/services/auth/business/internal/infra/primary/controllers/businesshandler/mappers"
	"central_reserve/services/auth/business/internal/infra/primary/controllers/businesshandler/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

var _ response.GetBusinessByIDResponse

// GetBusinessByID godoc
//
//	@Summary		Obtener negocio por ID
//	@Description	Obtiene un negocio específico por su ID
//	@Tags			businesses
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			id	path		int									true	"ID del negocio"
//	@Success		200	{object}	response.GetBusinessByIDResponse	"Negocio obtenido exitosamente"
//	@Failure		400	{object}	map[string]interface{}				"Solicitud inválida"
//	@Failure		401	{object}	map[string]interface{}				"Token de acceso requerido"
//	@Failure		500	{object}	map[string]interface{}				"Error interno del servidor"
//	@Router			/businesses/{id} [get]
func (h *BusinessHandler) GetBusinessByIDHandler(c *gin.Context) {
	// Obtener ID del path
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, mappers.BuildErrorResponse("invalid_id", "ID de negocio inválido"))
		return
	}

	// Ejecutar caso de uso
	business, err := h.usecase.GetBusinessByID(c.Request.Context(), uint(id))
	if err != nil {
		if err.Error() == "negocio no encontrado" {
			c.JSON(http.StatusNotFound, mappers.BuildErrorResponse("not_found", "Negocio no encontrado"))
			return
		}
		h.logger.Error().Err(err).Uint("id", uint(id)).Msg("Error al obtener negocio")
		c.JSON(http.StatusInternalServerError, mappers.BuildErrorResponse("internal_error", "Error interno del servidor"))
		return
	}

	// Construir respuesta exitosa
	response := mappers.BuildGetBusinessByIDResponseFromDTO(business, "Negocio obtenido exitosamente")
	c.JSON(http.StatusOK, response)
}
