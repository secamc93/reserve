package reservehandler

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/reserve/internal/infra/primary/controllers/reservehandler/mapper"
	"central_reserve/services/reserve/internal/infra/primary/controllers/reservehandler/request"

	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary		Crea una nueva reserva
// @Description	Este endpoint permite crear una nueva reserva para una mesa en un restaurante.
// @Tags			Reservas
// @Accept			json
// @Produce		json
// @Security		BearerAuth
// @Param			reservation	body		request.Reservation				true	"Datos de la reserva"
// @Success		201			{object}	object	"Reserva creada exitosamente"
// @Failure		400			{object}	map[string]interface{}			"Solicitud inválida"
// @Failure		401			{object}	map[string]interface{}			"Token de acceso requerido"
// @Failure		500			{object}	map[string]interface{}			"Error interno del servidor"
// @Router			/reserves [post]
func (h *ReserveHandler) CreateReserveHandler(c *gin.Context) {
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

	// 2. Obtener business_id del contexto de autenticación ─────
	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		h.logger.Error().Msg("business_id no disponible en el contexto de autenticación")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_business",
			"message": "Business ID no disponible",
		})
		return
	}
	req.BusinessID = businessID

	// 3. DTO → Dominio ───────────────────────────────────────
	reserve := mapper.ReserveToDomain(req)

	// 4. Caso de uso ─────────────────────────────────────────
	dni := ""
	if req.Dni != nil {
		dni = *req.Dni
	}
	responseReserve, err := h.usecase.CreateReserve(ctx, reserve, req.Name, req.Email, req.Phone, dni)
	if err != nil {
		h.logger.Error().Err(err).Msg("error interno al crear reserva")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo crear la reserva",
		})
		return
	}

	// 5. Dominio → Response ─────────────────────────────────
	reserveResponse := mapper.MapToReserveDetail(*responseReserve)

	// 6. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Reserva creada exitosamente",
		"data":    reserveResponse,
	})
}
