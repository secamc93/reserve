package clienthandler

import (
	"central_reserve/services/customer/internal/infra/primary/handlers/clienthandler/mapper"
	"central_reserve/services/customer/internal/infra/primary/handlers/clienthandler/request"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary		Crea un nuevo cliente
// @Description	Este endpoint permite crear un nuevo cliente para un restaurante.
// @Tags			Clientes
// @Accept			json
// @Produce		json
// @Security		BearerAuth
// @Param			client	body		request.Client			true	"Datos del cliente"
// @Success		201		{object}	map[string]interface{}	"Cliente creado exitosamente"
// @Failure		400		{object}	map[string]interface{}	"Solicitud inválida"
// @Failure		401		{object}	map[string]interface{}	"Token de acceso requerido"
// @Failure		500		{object}	map[string]interface{}	"Error interno del servidor"
// @Router			/clients [post]
func (h *ClientHandler) CreateClientHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Entrada ──────────────────────────────────────────────
	var req request.Client
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("error al bindear JSON de cliente")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_request",
			"message": "Los datos del cliente no son válidos",
		})
		return
	}

	// 2. DTO → Dominio ───────────────────────────────────────
	client := mapper.ClientToDomain(req)

	// 3. Caso de uso ─────────────────────────────────────────
	response, err := h.usecase.CreateClient(ctx, client)
	if err != nil {
		h.logger.Error().Err(err).Msg("error interno al crear cliente")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo crear el cliente",
		})
		return
	}

	// 4. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Cliente creado exitosamente",
		"data":    response,
	})
}
