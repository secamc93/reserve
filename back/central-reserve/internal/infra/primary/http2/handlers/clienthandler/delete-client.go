package clienthandler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Elimina un cliente
// @Description  Este endpoint permite eliminar un cliente existente del sistema.
// @Tags         Clientes
// @Accept       json
// @Produce      json
// @Param        id  path      int  true  "ID del cliente"
// @Success      200 {object}  map[string]interface{} "Cliente eliminado exitosamente"
// @Failure      400 {object}  map[string]interface{} "Solicitud inválida"
// @Failure      404 {object}  map[string]interface{} "Cliente no encontrado"
// @Failure      500 {object}  map[string]interface{} "Error interno del servidor"
// @Router       /clients/{id} [delete]
func (h *ClientHandler) DeleteClientHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Obtener ID del parámetro ────────────────────────────
	idParam := c.Param("id")
	clientID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Msg("ID de cliente inválido")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_id",
			"message": "El ID del cliente no es válido",
		})
		return
	}

	// 2. Caso de uso ─────────────────────────────────────────
	response, err := h.usecase.DeleteClient(ctx, uint(clientID))
	if err != nil {
		h.logger.Error().Err(err).Msg("error interno al eliminar cliente")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo eliminar el cliente",
		})
		return
	}

	// 3. Verificar si el cliente existía ────────────────────
	if response == "" {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "not_found",
			"message": "Cliente no encontrado",
		})
		return
	}

	// 4. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Cliente eliminado exitosamente",
		"data":    response,
	})
}
