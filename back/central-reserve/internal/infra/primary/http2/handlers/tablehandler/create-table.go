package tablehandler

import (
	"central_reserve/internal/infra/primary/http2/handlers/tablehandler/mapper"
	"central_reserve/internal/infra/primary/http2/handlers/tablehandler/request"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// @Summary      Crea una nueva mesa
// @Description  Este endpoint permite crear una nueva mesa para un restaurante.
// @Tags         Mesas
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        table  body      request.Table  true  "Datos de la mesa"
// @Success      201    {object}  map[string]interface{} "Mesa creada exitosamente"
// @Failure      400    {object}  map[string]interface{} "Solicitud inválida"
// @Failure      401    {object}  map[string]interface{} "Token de acceso requerido"
// @Failure      409    {object}  map[string]interface{} "Mesa ya existe para este restaurante"
// @Failure      500    {object}  map[string]interface{} "Error interno del servidor"
// @Router       /tables [post]
func (h *TableHandler) CreateTableHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Entrada ──────────────────────────────────────────────
	var req request.Table
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("error al bindear JSON de mesa")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid_request",
			"message": "Los datos de la mesa no son válidos",
		})
		return
	}

	// 2. DTO → Dominio ───────────────────────────────────────
	table := mapper.TableToDomain(req)

	// 3. Caso de uso ─────────────────────────────────────────
	response, err := h.usecase.CreateTable(ctx, table)
	if err != nil {
		// Manejar error de mesa duplicada
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			h.logger.Warn().Err(err).Msg("mesa ya existe para este restaurante")
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"error":   "table_already_exists",
				"message": "Ya existe una mesa con este número para el restaurante",
			})
			return
		}

		h.logger.Error().Err(err).Msg("error interno al crear mesa")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudo crear la mesa",
		})
		return
	}

	// 4. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Mesa creada exitosamente",
		"data":    response,
	})
}
