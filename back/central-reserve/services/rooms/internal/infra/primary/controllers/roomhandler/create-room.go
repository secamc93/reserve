package roomhandler

import (
	"central_reserve/services/rooms/internal/infra/primary/controllers/roomhandler/mapper"
	"central_reserve/services/rooms/internal/infra/primary/controllers/roomhandler/request"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// @Summary      Crea una nueva sala
// @Description  Este endpoint permite crear una nueva sala para un negocio.
// @Tags         Salas
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        room  body      request.Room  true  "Datos de la sala"
// @Success      201    {object}  map[string]interface{} "Sala creada exitosamente"
// @Failure      400    {object}  map[string]interface{} "Solicitud inválida"
// @Failure      401    {object}  map[string]interface{} "Token de acceso requerido"
// @Failure      409    {object}  map[string]interface{} "Sala ya existe para este negocio"
// @Failure      500    {object}  map[string]interface{} "Error interno del servidor"
// @Router       /rooms [post]
func (h *RoomHandler) CreateRoomHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Entrada ──────────────────────────────────────────────
	var req request.Room
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("error al bindear JSON de sala")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_request",
			"message": "Los datos de la sala no son válidos",
		})
		return
	}

	// 2. DTO → Dominio ───────────────────────────────────────
	room := mapper.RoomToDomain(req)

	// 3. Caso de uso ─────────────────────────────────────────
	response, err := h.usecase.CreateRoom(ctx, room)
	if err != nil {
		// Manejar error de sala duplicada
		if strings.Contains(err.Error(), "ya existe una sala con el código") {
			h.logger.Warn().Err(err).Msg("sala ya existe para este negocio")
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"error":   "room_already_exists",
				"message": err.Error(),
			})
			return
		}

		// Manejar errores de validación
		if strings.Contains(err.Error(), "es requerido") || strings.Contains(err.Error(), "debe ser mayor") {
			h.logger.Warn().Err(err).Msg("error de validación al crear sala")
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "validation_error",
				"message": err.Error(),
			})
			return
		}

		h.logger.Error().Err(err).Msg("error interno al crear sala")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo crear la sala",
		})
		return
	}

	// 4. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Sala creada exitosamente",
		"data":    response,
	})
}
