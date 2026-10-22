package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

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

func groupIDParam(c *gin.Context) (uint, bool) {
	id, err := strconv.ParseUint(c.Param("group_id"), 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "group_id inválido", Error: "Debe ser numérico y > 0"})
		return 0, false
	}
	return uint(id), true
}

func userID(c *gin.Context) *uint {
	if id, ok := middleware.GetUserID(c); ok && id != 0 {
		return &id
	}
	return nil
}

func requireSuperAdmin(c *gin.Context) bool {
	if !middleware.IsSuperAdmin(c) {
		c.JSON(http.StatusForbidden, response.ErrorResponse{Success: false, Message: "Solo el super admin puede hacer esto"})
		return false
	}
	return true
}

// writeError traduce los errores del dominio a HTTP.
func writeError(c *gin.Context, err error) {
	status, msg := http.StatusInternalServerError, "Error procesando el pago"
	switch {
	case errors.Is(err, domainerrors.ErrVotingGroupNotFound):
		status, msg = http.StatusNotFound, "Grupo de votación no encontrado"
	case errors.Is(err, domainerrors.ErrNothingDue):
		status, msg = http.StatusConflict, "Este grupo de votación no tiene días pendientes de pago"
	case errors.Is(err, domainerrors.ErrGatewayNotConfigured):
		status, msg = http.StatusServiceUnavailable, "La pasarela de pagos no está configurada"
	case errors.Is(err, domainerrors.ErrInvalidRedirectURL):
		status, msg = http.StatusBadRequest, "redirect_url debe ser una URL http(s)"
	case errors.Is(err, domainerrors.ErrPaymentNotFound):
		status, msg = http.StatusNotFound, "No hay un pago con esa transacción"
	case errors.Is(err, domainerrors.ErrTransactionMismatch):
		status, msg = http.StatusConflict, "La transacción no corresponde a este pago"
	}
	c.JSON(status, response.ErrorResponse{Success: false, Message: msg, Error: err.Error()})
}
