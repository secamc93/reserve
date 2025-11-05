package reservehandler

import (
	"central_reserve/services/reserve/internal/infra/primary/controllers/reservehandler/mapper"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary		Obtiene una reserva por ID
// @Description	Este endpoint obtiene una reserva específica con información completa de cliente, mesa, restaurante y estado
// @Tags			Reservas
// @Accept			json
// @Produce		json
// @Security		BearerAuth
// @Param			id	path		int								true	"ID de la reserva"
// @Success		200	{object} object	"Reserva obtenida exitosamente"
// @Failure		400	{object}	map[string]interface{}			"ID inválido"
// @Failure		401	{object}	map[string]interface{}			"Token de acceso requerido"
// @Failure		404	{object}	map[string]interface{}			"Reserva no encontrada"
// @Failure		500	{object}	map[string]interface{}			"Error interno del servidor"
// @Router			/reserves/{id} [get]
func (h *ReserveHandler) GetReserveByIDHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Obtener ID de la reserva ─────────────────────────────
	idParam := c.Param("id")
	reservationID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Msg("ID de reserva inválido")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_id",
			"message": "ID de reserva inválido",
		})
		return
	}

	// 2. Caso de uso ─────────────────────────────────────────
	reserve, err := h.usecase.GetReserveByID(ctx, uint(reservationID))
	if err != nil {
		// Verificar si es error de "not found" de GORM
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "not_found",
				"message": "Reserva no encontrada",
			})
			return
		}

		h.logger.Error().Err(err).Msg("error interno al obtener reserva")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo obtener la reserva",
		})
		return
	}

	// 3. Mapear a respuesta ──────────────────────────────────
	reserveDetail := mapper.MapToReserveDetail(*reserve)

	// 4. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Reserva obtenida exitosamente",
		"data":    reserveDetail,
	})
}
