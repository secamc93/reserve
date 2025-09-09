package tablehandler

import (
	"central_reserve/services/tables/internal/infra/primary/controllers/tablehandler/mapper"
	"central_reserve/services/tables/internal/infra/primary/controllers/tablehandler/request"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Actualiza una mesa
// @Description  Este endpoint permite actualizar los datos de una mesa específica.
// @Tags         Mesas
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      int                true  "ID de la mesa"
// @Param        table  body      request.UpdateTable true  "Datos a actualizar"
// @Success      200          {object}  map[string]interface{} "Mesa actualizada exitosamente"
// @Failure      400          {object}  map[string]interface{} "Solicitud inválida"
// @Failure      401          {object}  map[string]interface{} "Token de acceso requerido"
// @Failure      404          {object}  map[string]interface{} "Mesa no encontrada"
// @Failure      500          {object}  map[string]interface{} "Error interno del servidor"
// @Router       /tables/{id} [put]
func (h *TableHandler) UpdateTableHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Obtener ID del parámetro ────────────────────────────
	idParam := c.Param("id")
	tableID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Msg("ID de mesa inválido")
		errorResponse := mapper.BuildErrorResponse("invalid_id", "El ID de la mesa no es válido")
		c.JSON(http.StatusBadRequest, errorResponse)
		return
	}

	// 2. Entrada ──────────────────────────────────────────────
	var req request.UpdateTable
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("error al bindear JSON de actualización de mesa")
		errorResponse := mapper.BuildErrorResponse("invalid_request", "Los datos de actualización no son válidos")
		c.JSON(http.StatusBadRequest, errorResponse)
		return
	}

	// 3. DTO → Dominio ───────────────────────────────────────
	updateData := mapper.UpdateTableToDomain(req)

	// 4. Caso de uso ─────────────────────────────────────────
	response, err := h.usecase.UpdateTable(ctx, uint(tableID), updateData)
	if err != nil {
		h.logger.Error().Err(err).Msg("error interno al actualizar mesa")
		errorResponse := mapper.BuildErrorResponse("internal_error", "No se pudo actualizar la mesa")
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	// 5. Verificar si la mesa existía ───────────────────────
	if response == "" {
		errorResponse := mapper.BuildErrorResponse("not_found", "Mesa no encontrada")
		c.JSON(http.StatusNotFound, errorResponse)
		return
	}

	// 6. Salida ──────────────────────────────────────────────
	responseDTO := mapper.BuildUpdateTableStringResponse("Mesa actualizada exitosamente")
	c.JSON(http.StatusOK, responseDTO)
}
