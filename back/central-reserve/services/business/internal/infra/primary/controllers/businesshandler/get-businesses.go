package businesshandler

import (
	"net/http"
	"strconv"

	"central_reserve/services/business/internal/infra/primary/controllers/businesshandler/mapper"

	"github.com/gin-gonic/gin"
)

// GetBusinesses godoc
//
//	@Summary		Obtener lista de negocios
//	@Description	Obtiene una lista paginada de todos los negocios del sistema
//	@Tags			businesses
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			page	query		int						false	"Número de página (por defecto 1)"
//	@Param			limit	query		int						false	"Límite de elementos por página (por defecto 10)"
//	@Success		201		{object}	map[string]interface{}	"Negocios obtenidos exitosamente"
//	@Failure		400		{object}	map[string]interface{}	"Solicitud inválida"
//	@Failure		401		{object}	map[string]interface{}	"Token de acceso requerido"
//	@Failure		500		{object}	map[string]interface{}	"Error interno del servidor"
//	@Router			/businesses [get]
func (h *BusinessHandler) GetBusinesses(c *gin.Context) {
	// Obtener parámetros de paginación
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 10
	}

	// Ejecutar caso de uso
	businesses, err := h.usecase.GetBusinesses(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, mapper.BuildErrorResponse("internal_error", "Error interno del servidor"))
		return
	}

	// Construir respuesta exitosa
	response := mapper.BuildGetBusinessesResponseFromDTOs(businesses, "Negocios obtenidos exitosamente")
	c.JSON(http.StatusOK, response)
}
