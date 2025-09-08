package reservehandler

import (
	"central_reserve/services/reserve/internal/infra/primary/controllers/reservehandler/mapper"
	"central_reserve/services/reserve/internal/infra/primary/controllers/reservehandler/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetReservationStatusesHandler obtiene los estados de reserva
// @Summary      Lista los estados de reserva
// @Description  Obtiene todos los estados de reserva disponibles
// @Tags         Reservas
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  response.ReservationStatusListSuccessResponse "Estados de reserva obtenidos correctamente"
// @Failure      500  {object}  map[string]interface{} "Error interno del servidor"
// @Router       /reserves/status [get]
func (h *ReserveHandler) GetReservationStatusesHandler(c *gin.Context) {
	ctx := c.Request.Context()

	statuses, err := h.usecase.GetReservationStatuses(ctx)
	if err != nil {
		h.logger.Error().Err(err).Msg("error al obtener estados de reserva")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudieron obtener los estados de reserva",
		})
		return
	}

	statusList := mapper.MapToReservationStatusList(statuses)
	c.JSON(http.StatusOK, response.ReservationStatusListSuccessResponse{
		Success: true,
		Data:    statusList,
	})
}
