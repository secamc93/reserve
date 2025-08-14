package reservehandler

import (
	"central_reserve/internal/infra/primary/http2/handlers/reservehandler/mapper"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// @Summary      Obtiene todas las reservas
// @Description  Este endpoint obtiene todas las reservas con información completa de cliente, mesa, restaurante y estado. Soporta filtros opcionales.
// @Tags         Reservas
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        status_id   query    int     false  "ID del estado de reserva"
// @Param        client_id   query    int     false  "ID del cliente"
// @Param        table_id    query    int     false  "ID de la mesa"
// @Param        start_date  query    string  false  "Fecha de inicio (formato RFC3339: 2024-01-01T00:00:00Z)"
// @Param        end_date    query    string  false  "Fecha de fin (formato RFC3339: 2024-12-31T23:59:59Z)"
// @Success      200  {object}  response.ReserveListSuccessResponse "Lista de reservas obtenida exitosamente"
// @Failure      400  {object}  map[string]interface{} "Parámetros inválidos"
// @Failure      401  {object}  map[string]interface{} "Token de acceso requerido"
// @Failure      500  {object}  map[string]interface{} "Error interno del servidor"
// @Router       /reserves [get]
func (h *ReserveHandler) GetReservesHandler(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Parsear parámetros de query opcionales ──────────────
	var statusID, clientID, tableID *uint
	var startDate, endDate *time.Time

	// Parsear status_id
	if statusStr := c.Query("status_id"); statusStr != "" {
		if parsed, err := strconv.ParseUint(statusStr, 10, 32); err == nil {
			val := uint(parsed)
			statusID = &val
		} else {
			h.logger.Error().Err(err).Msg("status_id inválido")
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "invalid_status_id",
				"message": "El parámetro status_id debe ser un número válido",
			})
			return
		}
	}

	// Parsear client_id
	if clientStr := c.Query("client_id"); clientStr != "" {
		if parsed, err := strconv.ParseUint(clientStr, 10, 32); err == nil {
			val := uint(parsed)
			clientID = &val
		} else {
			h.logger.Error().Err(err).Msg("client_id inválido")
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "invalid_client_id",
				"message": "El parámetro client_id debe ser un número válido",
			})
			return
		}
	}

	// Parsear table_id
	if tableStr := c.Query("table_id"); tableStr != "" {
		if parsed, err := strconv.ParseUint(tableStr, 10, 32); err == nil {
			val := uint(parsed)
			tableID = &val
		} else {
			h.logger.Error().Err(err).Msg("table_id inválido")
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "invalid_table_id",
				"message": "El parámetro table_id debe ser un número válido",
			})
			return
		}
	}

	// Parsear start_date
	if startStr := c.Query("start_date"); startStr != "" {
		if parsed, err := time.Parse(time.RFC3339, startStr); err == nil {
			startDate = &parsed
		} else {
			h.logger.Error().Err(err).Msg("start_date inválido")
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "invalid_start_date",
				"message": "El parámetro start_date debe tener formato RFC3339 (ej: 2024-01-01T00:00:00Z)",
			})
			return
		}
	}

	// Parsear end_date
	if endStr := c.Query("end_date"); endStr != "" {
		if parsed, err := time.Parse(time.RFC3339, endStr); err == nil {
			endDate = &parsed
		} else {
			h.logger.Error().Err(err).Msg("end_date inválido")
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "invalid_end_date",
				"message": "El parámetro end_date debe tener formato RFC3339 (ej: 2024-12-31T23:59:59Z)",
			})
			return
		}
	}

	// 2. Caso de uso ─────────────────────────────────────────
	reserves, err := h.usecase.GetReserves(ctx, statusID, clientID, tableID, startDate, endDate)
	if err != nil {
		h.logger.Error().Err(err).Msg("error interno al obtener reservas")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "internal_error",
			"message": "No se pudieron obtener las reservas",
		})
		return
	}

	// 3. Mapear a respuesta ──────────────────────────────────
	reserveList := mapper.MapToReserveDetailList(reserves)

	// 4. Salida ──────────────────────────────────────────────
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Reservas obtenidas exitosamente",
		"data":    reserveList,
		"total":   len(reserveList),
		"filters": gin.H{
			"status_id":  statusID,
			"client_id":  clientID,
			"table_id":   tableID,
			"start_date": startDate,
			"end_date":   endDate,
		},
	})
}
