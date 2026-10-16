package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// businessScope devuelve la propiedad de la petición: la del token para usuarios normales; para
// el super admin (su token trae business_id = 0) la de ?business_id, obligatoria. Si falta,
// responde el error y devuelve false.
func businessScope(c *gin.Context) (uint, bool) {
	if middleware.IsSuperAdmin(c) {
		id, err := strconv.ParseUint(c.Query("business_id"), 10, 32)
		if err != nil || id == 0 {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id requerido", Error: "El super admin debe enviar ?business_id (numérico y > 0)"})
			return 0, false
		}
		return uint(id), true
	}
	id, ok := middleware.GetBusinessID(c)
	if !ok || id == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "business_id no disponible en el token"})
		return 0, false
	}
	return id, true
}
