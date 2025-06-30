package holamundohandler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// getSaludo maneja la solicitud GET para obtener un saludo personalizado
// @Summary      Obtener saludo personalizado
// @Description  Este endpoint retorna un mensaje de saludo personalizado y más detallado.
// @Description  Incluye información adicional como timestamp y versión de la API.
// @Description  Ideal para pruebas más avanzadas del sistema.
// @Tags         HolaMundo
// @Accept       json
// @Produce      json
// @Success      200  {object}  map[string]interface{}  "Saludo personalizado obtenido exitosamente"
// @Failure      500  {object}  map[string]interface{}  "Error interno del servidor"
// @Router       /api/v1/holamundo/saludo [get]
// @Example      Respuesta exitosa:
// @Example      {
// @Example        "success": true,
// @Example        "message": "¡Saludos personalizados desde la API!",
// @Example        "data": {
// @Example          "saludo": "¡Saludos personalizados desde la API!",
// @Example          "timestamp": "2024-01-01T00:00:00Z",
// @Example          "version": "v1"
// @Example        }
// @Example      }
func (h *HolaMundoHandler) GetSaludo(c *gin.Context) {
	ctx := c.Request.Context()

	// Llamar al caso de uso para verificar que el servicio funciona
	_, err := h.usecase.HolaMundo(ctx)
	if err != nil {
		h.logger.Error().Err(err).Msg("Error al obtener el saludo personalizado")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error interno del servidor",
			"message": "No se pudo obtener el saludo personalizado",
		})
		return
	}

	// Respuesta exitosa con mensaje personalizado
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "¡Saludos personalizados desde la API!",
		"data": gin.H{
			"saludo":    "¡Saludos personalizados desde la API!",
			"timestamp": "2024-01-01T00:00:00Z",
			"version":   "v1",
		},
	})
}
