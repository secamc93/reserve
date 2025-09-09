package tablehandler

import (
	"central_reserve/services/tables/internal/infra/primary/controllers/tablehandler/mapper"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary      Obtiene todas las mesas
// @Description  Este endpoint permite obtener la lista de todas las mesas registradas.
// @Tags         Mesas
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200          {object}  map[string]interface{} "Lista de mesas obtenida exitosamente"
// @Failure      401          {object}  map[string]interface{} "Token de acceso requerido"
// @Failure      500          {object}  map[string]interface{} "Error interno del servidor"
// @Router       /tables [get]
func (h *TableHandler) GetTablesHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Caso de uso ─────────────────────────────────────────
	tables, err := h.usecase.GetTables(ctx)
	if err != nil {
		h.logger.Error().Err(err).Msg("error interno al obtener mesas")
		errorResponse := mapper.BuildErrorResponse("internal_error", "No se pudieron obtener las mesas")
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	// 2. Salida ──────────────────────────────────────────────
	response := mapper.BuildGetTablesResponse(tables, "Mesas obtenidas exitosamente")
	c.JSON(http.StatusOK, response)
}
