package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	domainerrors "central_reserve/services/horizontalproperty/membership/internal/domain/errors"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// businessScope: la propiedad del token para usuarios normales; ?business_id para el super admin.
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

// currentUser devuelve el usuario del token; si falta responde 401.
func currentUser(c *gin.Context) (uint, bool) {
	id, ok := middleware.GetUserID(c)
	if !ok || id == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "usuario no disponible en el token"})
		return 0, false
	}
	return id, true
}

func badRequest(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
}

// writeError traduce los errores del dominio a HTTP.
func writeError(c *gin.Context, err error) {
	status, msg := http.StatusInternalServerError, "Error procesando la membresía"
	switch {
	case errors.Is(err, domainerrors.ErrPlanNotFound):
		status, msg = http.StatusBadRequest, "Plan no encontrado"
	case errors.Is(err, domainerrors.ErrInvalidProperties):
		status, msg = http.StatusBadRequest, "Elige entre 1 conjunto y el máximo del plan"
	case errors.Is(err, domainerrors.ErrPropertyNotManaged):
		status, msg = http.StatusForbidden, "No administras alguno de esos conjuntos"
	case errors.Is(err, domainerrors.ErrInvalidSource):
		status, msg = http.StatusBadRequest, "Origen inválido: manual o cortesia"
	case errors.Is(err, domainerrors.ErrGatewayNotConfigured):
		status, msg = http.StatusServiceUnavailable, "La pasarela de pagos no está configurada"
	case errors.Is(err, domainerrors.ErrInvalidRedirectURL):
		status, msg = http.StatusBadRequest, "redirect_url debe ser una URL http(s)"
	case errors.Is(err, domainerrors.ErrPaymentNotFound):
		status, msg = http.StatusNotFound, "No hay una membresía con esa transacción"
	case errors.Is(err, domainerrors.ErrTransactionMismatch):
		status, msg = http.StatusConflict, "La transacción no corresponde a tu membresía"
	}
	c.JSON(status, response.ErrorResponse{Success: false, Message: msg, Error: err.Error()})
}
