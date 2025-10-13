package tablehandler

import (
	"central_reserve/services/tables/internal/infra/primary/controllers/tablehandler/mapper"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary		Elimina una mesa
// @Description	Este endpoint permite eliminar una mesa específica por su ID.
// @Tags			Mesas
// @Accept			json
// @Produce		json
// @Security		BearerAuth
// @Param			id	path		int						true	"ID de la mesa"
// @Success		200	{object}	map[string]interface{}	"Mesa eliminada exitosamente"
// @Failure		400	{object}	map[string]interface{}	"Solicitud inválida"
// @Failure		401	{object}	map[string]interface{}	"Token de acceso requerido"
// @Failure		404	{object}	map[string]interface{}	"Mesa no encontrada"
// @Failure		500	{object}	map[string]interface{}	"Error interno del servidor"
// @Router			/tables/{id} [delete]
func (h *TableHandler) DeleteTableHandler(c *gin.Context) {
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
	response, err := h.usecase.DeleteTable(ctx, uint(tableID))
	if err != nil {
		h.logger.Error().Err(err).Msg("error interno al eliminar mesa")
		errorResponse := mapper.BuildErrorResponse("internal_error", "No se pudo eliminar la mesa")
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	// 3. Verificar si la mesa existía ───────────────────────
	if response == "" {
		errorResponse := mapper.BuildErrorResponse("not_found", "Mesa no encontrada")
		c.JSON(http.StatusNotFound, errorResponse)
		return
	}

	// 4. Salida ──────────────────────────────────────────────
	responseDTO := mapper.BuildDeleteTableResponse("Mesa eliminada exitosamente")
	c.JSON(http.StatusOK, responseDTO)
}
