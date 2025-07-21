package tablehandler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Elimina una mesa
// @Description  Este endpoint permite eliminar una mesa existente del sistema.
// @Tags         Mesas
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path      int  true  "ID de la mesa"
// @Success      200 {object}  map[string]interface{} "Mesa eliminada exitosamente"
// @Failure      400 {object}  map[string]interface{} "Solicitud inválida"
// @Failure      401 {object}  map[string]interface{} "Token de acceso requerido"
// @Failure      404 {object}  map[string]interface{} "Mesa no encontrada"
// @Failure      500 {object}  map[string]interface{} "Error interno del servidor"
// @Router       /tables/{id} [delete]
func (h *TableHandler) DeleteTableHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Obtener ID del parámetro ────────────────────────────
	idParam := c.Param("id")
	tableID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Msg("ID de mesa inválido")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_id",
			"message": "El ID de la mesa no es válido",
		})
		return
	}

	// 2. Caso de uso ─────────────────────────────────────────
	response, err := h.usecase.DeleteTable(ctx, uint(tableID))
	if err != nil {
		h.logger.Error().Err(err).Msg("error interno al eliminar mesa")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo eliminar la mesa",
		})
		return
	}

	// 3. Verificar si la mesa existía ───────────────────────
	if response == "" {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "not_found",
			"message": "Mesa no encontrada",
		})
		return
	}

	// 4. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mesa eliminada exitosamente",
		"data":    response,
	})
}
