package handlers

import (
	"errors"
	"strconv"

	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

var errBusinessIDInvalid = errors.New("business_id inválido")

// resolveBusinessID devuelve el negocio de la petición: el del token para un usuario normal;
// para el super admin (business_id = 0 en el token), el del query `business_id` (0 = todos).
func resolveBusinessID(c *gin.Context) (uint, bool, error) {
	tokenBusinessID, exists := middleware.GetBusinessID(c)
	if !exists {
		return 0, false, nil
	}
	if tokenBusinessID != 0 || !middleware.IsSuperAdmin(c) {
		return tokenBusinessID, true, nil
	}
	raw := c.Query("business_id")
	if raw == "" {
		return 0, true, nil
	}
	id, err := strconv.ParseUint(raw, 10, 32)
	if err != nil {
		return 0, true, errBusinessIDInvalid
	}
	return uint(id), true, nil
}
