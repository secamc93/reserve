package reservehandler

import (
	"central_reserve/services/reserve/internal/domain"
	"central_reserve/services/reserve/internal/infra/primary/controllers/reservehandler/request"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Actualiza una reserva
// @Description  Este endpoint permite actualizar campos específicos de una reserva existente
// @Tags         Reservas
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path    int                        true  "ID de la reserva"
// @Param        update  body    request.UpdateReservation  true  "Datos para actualizar"
// @Success      200     {object}  map[string]interface{}  "Reserva actualizada exitosamente"
// @Failure      400     {object}  map[string]interface{}  "Solicitud inválida"
// @Failure      401     {object}  map[string]interface{}  "Token de acceso requerido"
// @Failure      404     {object}  map[string]interface{}  "Reserva no encontrada"
// @Failure      500     {object}  map[string]interface{}  "Error interno del servidor"
// @Router       /reserves/{id} [put]
func (h *ReserveHandler) UpdateReservationHandler(c *gin.Context) {
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

	// 2. Parsear datos de actualización ──────────────────────
	var updateReq request.UpdateReservation
	if err := c.ShouldBindJSON(&updateReq); err != nil {
		h.logger.Error().Err(err).Msg("error al bindear JSON de actualización")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_request",
			"message": "Los datos de actualización no son válidos",
		})
		return
	}

	// 3. Caso de uso ─────────────────────────────────────────
	params := domain.UpdateReservationDTO{
		ID:             uint(reservationID),
		TableID:        updateReq.TableID,
		StartAt:        updateReq.StartAt,
		EndAt:          updateReq.EndAt,
		NumberOfGuests: updateReq.NumberOfGuests,
		StatusID:       updateReq.StatusID,
	}

	response, err := h.usecase.UpdateReservation(ctx, params)
	if err != nil {
		h.logger.Error().Err(err).Msg("error interno al actualizar reserva")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo actualizar la reserva",
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
