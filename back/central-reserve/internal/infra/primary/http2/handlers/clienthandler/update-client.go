package clienthandler

import (
	"central_reserve/internal/infra/primary/http2/handlers/clienthandler/mapper"
	"central_reserve/internal/infra/primary/http2/handlers/clienthandler/request"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Actualiza un cliente existente
// @Description  Este endpoint permite actualizar parcialmente los datos de un cliente. Solo se modifican los campos enviados.
// @Tags         Clientes
// @Accept       json
// @Produce      json
// @Param        id      path      int                      true  "ID del cliente"
// @Param        client  body      request.UpdateClient     true  "Datos del cliente a actualizar"
// @Success      200     {object}  map[string]interface{}   "Cliente actualizado exitosamente"
// @Failure      400     {object}  map[string]interface{}   "Solicitud inválida"
// @Failure      404     {object}  map[string]interface{}   "Cliente no encontrado"
// @Failure      500     {object}  map[string]interface{}   "Error interno del servidor"
// @Router       /clients/{id} [put]
func (h *ClientHandler) UpdateClientHandler(c *gin.Context) {
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

	// 2. Entrada ──────────────────────────────────────────────
	var req request.UpdateClient
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("error al bindear JSON de actualización de cliente")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_request",
			"message": "Los datos del cliente no son válidos",
		})
		return
	}

	// 3. DTO → Dominio ───────────────────────────────────────
	client := mapper.UpdateClientToDomain(req)

	// 4. Caso de uso ─────────────────────────────────────────
	response, err := h.usecase.UpdateClient(ctx, uint(clientID), client)
	if err != nil {
		h.logger.Error().Err(err).Msg("error interno al actualizar cliente")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo actualizar el cliente",
		})
		return
	}

	// 5. Verificar si el cliente existía ───────────────────────
	if response == "" {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "not_found",
			"message": "Cliente no encontrado",
		})
		return
	}

	// 6. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Cliente actualizado exitosamente",
		"data":    response,
	})
}
