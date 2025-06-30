package holamundohandler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// getHolaMundo maneja la solicitud GET para obtener el saludo básico
// @Summary      Obtener saludo básico del sistema
// @Description  Este endpoint retorna un mensaje de saludo básico del sistema.
// @Description  Es útil para verificar que la API está funcionando correctamente.
// @Description  No requiere autenticación y siempre retorna un mensaje estático.
// @Tags         HolaMundo
// @Accept       json
// @Produce      json
// @Success      200  {object}  map[string]interface{}  "Saludo obtenido exitosamente"
// @Failure      500  {object}  map[string]interface{}  "Error interno del servidor"
// @Router       /api/v1/holamundo [get]
// @Example      Respuesta exitosa:
// @Example      {
// @Example        "success": true,
// @Example        "message": "¡Hola Mundo desde el backend!",
// @Example        "data": {
// @Example          "saludo": "¡Hola Mundo desde el backend!",
// @Example          "timestamp": "2024-01-01T00:00:00Z",
// @Example          "version": "v1"
// @Example        }
// @Example      }
func (h *HolaMundoHandler) GetHolaMundo(c *gin.Context) {
	ctx := c.Request.Context()

	// Llamar al caso de uso
	mensaje, err := h.usecase.HolaMundo(ctx)
	if err != nil {
		h.logger.Error().Err(err).Msg("Error al obtener el saludo de HolaMundo")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error interno del servidor",
			"message": "No se pudo obtener el saludo",
		})
		return
	}

	// Respuesta exitosa
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": mensaje,
		"data": gin.H{
			"saludo":    mensaje,
			"timestamp": "2024-01-01T00:00:00Z",
			"version":   "v1",
		},
	})
}
