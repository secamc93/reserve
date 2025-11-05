package tablehandler

import (
	"central_reserve/services/tables/internal/infra/primary/controllers/tablehandler/mapper"
	"central_reserve/services/tables/internal/infra/primary/controllers/tablehandler/request"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// @Summary		Crea una nueva mesa
// @Description	Este endpoint permite crear una nueva mesa para un restaurante.
// @Tags			Mesas
// @Accept			json
// @Produce		json
// @Security		BearerAuth
// @Param			table	body		request.Table			true	"Datos de la mesa"
// @Success		201		{object}	map[string]interface{}	"Mesa creada exitosamente"
// @Failure		400		{object}	map[string]interface{}	"Solicitud inválida"
// @Failure		401		{object}	map[string]interface{}	"Token de acceso requerido"
// @Failure		409		{object}	map[string]interface{}	"Mesa ya existe para este restaurante"
// @Failure		500		{object}	map[string]interface{}	"Error interno del servidor"
// @Router			/tables [post]
func (h *TableHandler) CreateTableHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Entrada ──────────────────────────────────────────────
	var req request.Table
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("error al bindear JSON de mesa")
		errorResponse := mapper.BuildErrorResponse("invalid_request", "Los datos de la mesa no son válidos")
		c.JSON(http.StatusBadRequest, errorResponse)
		return
	}

	// 2. DTO → Dominio ───────────────────────────────────────
	table := mapper.TableToDomain(req)

	// 3. Caso de uso ─────────────────────────────────────────
	_, err := h.usecase.CreateTable(ctx, table)
	if err != nil {
		// Manejar error de mesa duplicada
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			h.logger.Warn().Err(err).Msg("mesa ya existe para este restaurante")
			errorResponse := mapper.BuildErrorResponse("table_already_exists", "Ya existe una mesa con este número para el restaurante")
			c.JSON(http.StatusConflict, errorResponse)
			return
		}

		h.logger.Error().Err(err).Msg("error interno al crear mesa")
		errorResponse := mapper.BuildErrorResponse("internal_error", "No se pudo crear la mesa")
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	// 4. Salida ──────────────────────────────────────────────
	responseDTO := mapper.BuildCreateTableStringResponse("Mesa creada exitosamente")
	c.JSON(http.StatusCreated, responseDTO)
}
