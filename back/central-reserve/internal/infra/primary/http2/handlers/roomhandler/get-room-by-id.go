package roomhandler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Obtiene una sala por ID
// @Description  Este endpoint permite obtener una sala específica por su ID.
// @Tags         Salas
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path      int  true  "ID de la sala"
// @Success      200    {object}  map[string]interface{} "Sala encontrada"
// @Failure      400    {object}  map[string]interface{} "ID de sala inválido"
// @Failure      401    {object}  map[string]interface{} "Token de acceso requerido"
// @Failure      404    {object}  map[string]interface{} "Sala no encontrada"
// @Failure      500    {object}  map[string]interface{} "Error interno del servidor"
// @Router       /rooms/{id} [get]
func (h *RoomHandler) GetRoomByIDHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// Obtener id de la URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Str("id", idStr).Msg("error al parsear id de sala")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_room_id",
			"message": "ID de sala inválido",
		})
		return
	}

	// Caso de uso
	room, err := h.usecase.GetRoomByID(ctx, uint(id))
	if err != nil {
		h.logger.Error().Err(err).Uint("id", uint(id)).Msg("error al obtener sala por ID")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo obtener la sala",
		})
		return
	}

	if room == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "room_not_found",
			"message": "Sala no encontrada",
		})
		return
	}

	// Respuesta
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sala obtenida exitosamente",
		"data":    room,
	})
}
