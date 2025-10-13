package roomhandler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary		Obtiene todas las salas
// @Description	Este endpoint permite obtener todas las salas del sistema.
// @Tags			Salas
// @Accept			json
// @Produce		json
// @Security		BearerAuth
// @Success		200	{object}	map[string]interface{}	"Lista de salas"
// @Failure		401	{object}	map[string]interface{}	"Token de acceso requerido"
// @Failure		500	{object}	map[string]interface{}	"Error interno del servidor"
// @Router			/rooms [get]
func (h *RoomHandler) GetRoomsHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// Caso de uso
	rooms, err := h.usecase.GetRooms(ctx)
	if err != nil {
		h.logger.Error().Err(err).Msg("error al obtener salas")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudieron obtener las salas",
		})
		return
	}

	// Respuesta
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Salas obtenidas exitosamente",
		"data":    rooms,
	})
}

// @Summary		Obtiene salas por negocio
// @Description	Este endpoint permite obtener todas las salas de un negocio específico.
// @Tags			Salas
// @Accept			json
// @Produce		json
// @Security		BearerAuth
// @Param			business_id	path		int						true	"ID del negocio"
// @Success		200			{object}	map[string]interface{}	"Lista de salas del negocio"
// @Failure		400			{object}	map[string]interface{}	"ID de negocio inválido"
// @Failure		401			{object}	map[string]interface{}	"Token de acceso requerido"
// @Failure		500			{object}	map[string]interface{}	"Error interno del servidor"
// @Router			/business-rooms/{business_id} [get]
func (h *RoomHandler) GetRoomsByBusinessHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// Obtener business_id de la URL
	businessIDStr := c.Param("business_id")
	businessID, err := strconv.ParseUint(businessIDStr, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Str("business_id", businessIDStr).Msg("error al parsear business_id")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_business_id",
			"message": "ID de negocio inválido",
		})
		return
	}

	// Caso de uso
	rooms, err := h.usecase.GetRoomsByBusinessID(ctx, uint(businessID))
	if err != nil {
		h.logger.Error().Err(err).Uint("businessID", uint(businessID)).Msg("error al obtener salas por negocio")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudieron obtener las salas del negocio",
		})
		return
	}

	// Respuesta
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Salas del negocio obtenidas exitosamente",
		"data":    rooms,
	})
}
