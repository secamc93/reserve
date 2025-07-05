package tablehandler

import (
	"central_reserve/internal/infra/primary/http2/handlers/tablehandler/mapper"
	"central_reserve/internal/infra/primary/http2/handlers/tablehandler/request"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// @Summary      Actualiza una mesa existente
// @Description  Este endpoint permite actualizar parcialmente los datos de una mesa. Solo se modifican los campos enviados.
// @Tags         Mesas
// @Accept       json
// @Produce      json
// @Param        id     path      int                      true  "ID de la mesa"
// @Param        table  body      request.UpdateTable     true  "Datos de la mesa a actualizar"
// @Success      200    {object}  map[string]interface{}   "Mesa actualizada exitosamente"
// @Failure      400    {object}  map[string]interface{}   "Solicitud inválida"
// @Failure      404    {object}  map[string]interface{}   "Mesa no encontrada"
// @Failure      409    {object}  map[string]interface{}   "Mesa con ese número ya existe"
// @Failure      500    {object}  map[string]interface{}   "Error interno del servidor"
// @Router       /tables/{id} [put]
func (h *TableHandler) UpdateTableHandler(c *gin.Context) {
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

	// 2. Entrada ──────────────────────────────────────────────
	var req request.UpdateTable
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("error al bindear JSON de actualización de mesa")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_request",
			"message": "Los datos de la mesa no son válidos",
		})
		return
	}

	// 3. DTO → Dominio ───────────────────────────────────────
	table := mapper.UpdateTableToDomain(req)

	// 4. Caso de uso ─────────────────────────────────────────
	response, err := h.usecase.UpdateTable(ctx, uint(tableID), table)
	if err != nil {
		// Manejar error de mesa duplicada
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			h.logger.Warn().Err(err).Msg("mesa con ese número ya existe para este restaurante")
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"error":   "table_number_exists",
				"message": "Ya existe una mesa con este número para el restaurante",
			})
			return
		}

		h.logger.Error().Err(err).Msg("error interno al actualizar mesa")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo actualizar la mesa",
		})
		return
	}

	// 5. Verificar si la mesa existía ───────────────────────
	if response == "" {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "not_found",
			"message": "Mesa no encontrada",
		})
		return
	}

	// 6. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mesa actualizada exitosamente",
		"data":    response,
	})
}
