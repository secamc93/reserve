package roomhandler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// @Summary      Elimina una sala
// @Description  Este endpoint permite eliminar una sala existente.
// @Tags         Salas
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path      int  true  "ID de la sala"
// @Success      200    {object}  map[string]interface{} "Sala eliminada exitosamente"
// @Failure      400    {object}  map[string]interface{} "ID de sala inválido"
// @Failure      401    {object}  map[string]interface{} "Token de acceso requerido"
// @Failure      404    {object}  map[string]interface{} "Sala no encontrada"
// @Failure      500    {object}  map[string]interface{} "Error interno del servidor"
// @Router       /rooms/{id} [delete]
func (h *RoomHandler) DeleteRoomHandler(c *gin.Context) {
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
	response, err := h.usecase.DeleteRoom(ctx, uint(id))
	if err != nil {
		// Manejar error de sala no encontrada
		if strings.Contains(err.Error(), "no existe") {
			h.logger.Warn().Err(err).Uint("id", uint(id)).Msg("sala no encontrada")
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "room_not_found",
				"message": err.Error(),
			})
			return
		}

		h.logger.Error().Err(err).Msg("error interno al eliminar sala")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo eliminar la sala",
		})
		return
	}

	// Respuesta
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sala eliminada exitosamente",
		"data":    response,
	})
}
