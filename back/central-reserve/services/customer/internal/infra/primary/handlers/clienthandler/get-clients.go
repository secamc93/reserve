package clienthandler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary      Obtiene todos los clientes
// @Description  Este endpoint permite obtener la lista de todos los clientes registrados.
// @Tags         Clientes
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  map[string]interface{} "Lista de clientes obtenida exitosamente"
// @Failure      401  {object}  map[string]interface{} "Token de acceso requerido"
// @Failure      500  {object}  map[string]interface{} "Error interno del servidor"
// @Router       /clients [get]
func (h *ClientHandler) GetClientsHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Caso de uso ─────────────────────────────────────────
	clients, err := h.usecase.GetClients(ctx)
	if err != nil {
		h.logger.Error().Err(err).Msg("error interno al obtener clientes")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudieron obtener los clientes",
		})
		return
	}

	// 2. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Clientes obtenidos exitosamente",
		"data":    clients,
	})
}
