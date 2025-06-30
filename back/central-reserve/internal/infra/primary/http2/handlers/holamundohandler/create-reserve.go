package holamundohandler

import (
	"central_reserve/internal/infra/primary/http2/handlers/holamundohandler/mapper"
	"central_reserve/internal/infra/primary/http2/handlers/holamundohandler/request"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary      Crea una nueva reserva
// @Description  Este endpoint permite crear una nueva reserva para una mesa en un restaurante.
// @Tags         Reservas
// @Accept       json
// @Produce      json
// @Param        reservation  body      request.Reservation  true  "Datos de la reserva"
// @Success      201          {object}  map[string]interface{} "Reserva creada exitosamente"
// @Failure      400          {object}  map[string]interface{} "Solicitud inválida"
// @Failure      500          {object}  map[string]interface{} "Error interno del servidor"
// @Router       /holamundo/reserve [post]
func (h *HolaMundoHandler) CreateReserveHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Entrada ──────────────────────────────────────────────
	var req request.Reservation
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("error al bindear JSON de reserva")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_request",
			"message": "Los datos de la reserva no son válidos",
		})
		return
	}

	// 2. DTO → Dominio ───────────────────────────────────────
	reserve := mapper.ReserveToDomain(req)

	// 3. Caso de uso ─────────────────────────────────────────
	responseReserve, err := h.usecase.CreateReserve(ctx, reserve)
	if err != nil {
		// Ejemplos de manejo de errores de negocio:
		switch {
		// case errors.Is(err, domain.ErrTableNotFound):
		// 	c.JSON(http.StatusNotFound, gin.H{
		// 		"success": false,
		// 		"error":   "table_not_found",
		// 		"message": "La mesa solicitada no existe",
		// 	})
		// case errors.Is(err, domain.ErrOverlappingReservation):
		// 	c.JSON(http.StatusConflict, gin.H{
		// 		"success": false,
		// 		"error":   "time_conflict",
		// 		"message": "La mesa ya está reservada en ese horario",
		// 	})
		default:
			h.logger.Error().Err(err).Msg("error interno al crear reserva")
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "internal_error",
				"message": "No se pudo crear la reserva",
			})
		}
		return
	}

	// 5. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Reserva creada exitosamente",
		"data":    responseReserve,
	})
}
