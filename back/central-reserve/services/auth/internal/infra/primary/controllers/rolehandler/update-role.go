package rolehandler

import (
	"central_reserve/services/auth/internal/infra/primary/controllers/rolehandler/mapper"
	"central_reserve/services/auth/internal/infra/primary/controllers/rolehandler/request"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// UpdateRole actualiza un rol existente
// @Summary Actualizar un rol
// @Description Actualiza un rol existente en el sistema (actualización parcial)
// @Tags Roles
// @Accept json
// @Produce json
// @Param id path int true "ID del rol a actualizar"
// @Param role body request.UpdateRoleRequest true "Datos del rol a actualizar"
// @Success 200 {object} response.UpdateRoleResponse
// @Failure 400 {object} map[string]interface{} "Datos de entrada inválidos"
// @Failure 404 {object} map[string]interface{} "Rol no encontrado"
// @Failure 500 {object} map[string]interface{} "Error interno del servidor"
// @Router /roles/{id} [put]
// @Security BearerAuth
func (h *RoleHandler) UpdateRole(c *gin.Context) {
	// Obtener ID del path parameter
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "ID inválido",
			"error":   "El ID debe ser un número válido",
		})
		return
	}

	var req request.UpdateRoleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Datos de entrada inválidos",
			"error":   err.Error(),
		})
		return
	}

	// Convertir request a DTO
	roleDTO := mapper.ToUpdateRoleDTO(req)

	// Actualizar el rol
	role, err := h.usecase.UpdateRole(c.Request.Context(), uint(id), roleDTO)
	if err != nil {
		statusCode := http.StatusInternalServerError
		message := "Error al actualizar el rol"

		if err.Error() == "rol no encontrado" {
			statusCode = http.StatusNotFound
			message = "Rol no encontrado"
		}

		c.JSON(statusCode, gin.H{
			"success": false,
			"message": message,
			"error":   err.Error(),
		})
		return
	}

	// Convertir a response
	response := mapper.ToUpdateRoleResponse(role)

	c.JSON(http.StatusOK, response)
}
