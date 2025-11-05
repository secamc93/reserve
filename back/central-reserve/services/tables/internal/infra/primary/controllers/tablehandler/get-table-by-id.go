package tablehandler

import (
	"central_reserve/services/tables/internal/infra/primary/controllers/tablehandler/mapper"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary		Obtiene una mesa por ID
// @Description	Este endpoint permite obtener los datos de una mesa específica por su ID.
// @Tags			Mesas
// @Accept			json
// @Produce		json
// @Security		BearerAuth
// @Param			id	path		int						true	"ID de la mesa"
// @Success		200	{object}	map[string]interface{}	"Mesa obtenida exitosamente"
// @Failure		400	{object}	map[string]interface{}	"Solicitud inválida"
// @Failure		401	{object}	map[string]interface{}	"Token de acceso requerido"
// @Failure		404	{object}	map[string]interface{}	"Mesa no encontrada"
// @Failure		500	{object}	map[string]interface{}	"Error interno del servidor"
// @Router			/tables/{id} [get]
func (h *TableHandler) GetTableByIDHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Obtener ID del parámetro ────────────────────────────
	idParam := c.Param("id")
	tableID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Msg("ID de mesa inválido")
		errorResponse := mapper.BuildErrorResponse("invalid_id", "El ID de la mesa no es válido")
		c.JSON(http.StatusBadRequest, errorResponse)
		return
	}

	// 2. Caso de uso ─────────────────────────────────────────
	table, err := h.usecase.GetTableByID(ctx, uint(tableID))
	if err != nil {
		// Si es error de "record not found", retornar 404
		if err.Error() == "record not found" {
			errorResponse := mapper.BuildErrorResponse("not_found", "Mesa no encontrada")
			c.JSON(http.StatusNotFound, errorResponse)
			return
		}

		h.logger.Error().Err(err).Msg("error interno al obtener mesa por ID")
		errorResponse := mapper.BuildErrorResponse("internal_error", "No se pudo obtener la mesa")
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	// 3. Salida ──────────────────────────────────────────────
	response := mapper.BuildGetTablePtrResponse(table, "Mesa obtenida exitosamente")
	c.JSON(http.StatusOK, response)
}
