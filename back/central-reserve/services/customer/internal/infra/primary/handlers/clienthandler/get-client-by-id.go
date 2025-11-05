package clienthandler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary		Obtiene un cliente por ID
// @Description	Este endpoint permite obtener los datos de un cliente específico por su ID.
// @Tags			Clientes
// @Accept			json
// @Produce		json
// @Security		BearerAuth
// @Param			id	path		int						true	"ID del cliente"
// @Success		200	{object}	map[string]interface{}	"Cliente obtenido exitosamente"
// @Failure		400	{object}	map[string]interface{}	"Solicitud inválida"
// @Failure		401	{object}	map[string]interface{}	"Token de acceso requerido"
// @Failure		404	{object}	map[string]interface{}	"Cliente no encontrado"
// @Failure		500	{object}	map[string]interface{}	"Error interno del servidor"
// @Router			/clients/{id} [get]
func (h *ClientHandler) GetClientByIDHandler(c *gin.Context) {
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
	client, err := h.usecase.GetClientByID(ctx, uint(clientID))
	if err != nil {
		// Si es error de "record not found", retornar 404
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "not_found",
				"message": "Cliente no encontrado",
			})
			return
		}

		h.logger.Error().Err(err).Msg("error interno al obtener cliente por ID")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo obtener el cliente",
		})
		return
	}

	// 3. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Cliente obtenido exitosamente",
		"data":    client,
	})
}
