package reservehandler

import (
	"central_reserve/internal/infra/primary/http2/handlers/reservehandler/request"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Cancela una reserva
// @Description  Este endpoint permite cancelar una reserva existente
// @Tags         Reservas
// @Accept       json
// @Produce      json
// @Param        id     path    int                           true  "ID de la reserva"
// @Param        cancel body    request.CancelReservation     false "Razón de cancelación (opcional)"
// @Success      200    {object}  map[string]interface{}     "Reserva cancelada exitosamente"
// @Failure      400    {object}  map[string]interface{}     "Solicitud inválida"
// @Failure      404    {object}  map[string]interface{}     "Reserva no encontrada"
// @Failure      500    {object}  map[string]interface{}     "Error interno del servidor"
// @Router       /reserves/{id}/cancel [patch]
func (h *ReserveHandler) CancelReservationHandler(c *gin.Context) {
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

	// 2. Parsear razón de cancelación (opcional) ──────────────
	var cancelReq request.CancelReservation
	if err := c.ShouldBindJSON(&cancelReq); err != nil {
		// Si no hay body o es inválido, continuar sin razón
		cancelReq.Reason = ""
	}

	// 3. Caso de uso ─────────────────────────────────────────
	response, err := h.usecase.CancelReservation(ctx, uint(reservationID), cancelReq.Reason)
	if err != nil {
		h.logger.Error().Err(err).Msg("error interno al cancelar reserva")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo cancelar la reserva",
		})
		return
	}

	// 4. Verificar si la reserva fue encontrada ──────────────
	if response == "" {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "not_found",
			"message": "Reserva no encontrada",
		})
		return
	}

	// 5. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": response,
	})
}
