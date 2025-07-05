package tablehandler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Obtiene una mesa por ID
// @Description  Este endpoint permite obtener los datos de una mesa específica por su ID.
// @Tags         Mesas
// @Accept       json
// @Produce      json
// @Param        id  path      int  true  "ID de la mesa"
// @Success      200 {object}  map[string]interface{} "Mesa obtenida exitosamente"
// @Failure      400 {object}  map[string]interface{} "Solicitud inválida"
// @Failure      404 {object}  map[string]interface{} "Mesa no encontrada"
// @Failure      500 {object}  map[string]interface{} "Error interno del servidor"
// @Router       /tables/{id} [get]
func (h *TableHandler) GetTableByIDHandler(c *gin.Context) {
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
	table, err := h.usecase.GetTableByID(ctx, uint(tableID))
	if err != nil {
		// Si es error de "record not found", retornar 404
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "not_found",
				"message": "Mesa no encontrada",
			})
			return
		}

		h.logger.Error().Err(err).Msg("error interno al obtener mesa por ID")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo obtener la mesa",
		})
		return
	}

	// 3. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mesa obtenida exitosamente",
		"data":    table,
	})
}
