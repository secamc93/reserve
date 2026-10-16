package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// Alcance multi-tenant del módulo:
//   - usuario normal: el business_id sale SIEMPRE del token;
//   - super admin (business_id = 0 en el token): envía ?business_id=.
// Los recursos por ID (zona, reserva) se validan contra ese alcance y responden 404 si
// pertenecen a otra propiedad.

// resolveBusinessID devuelve el business_id obligatorio para listar o crear.
// Si falla, ya escribió la respuesta de error.
func (h *CommonAreaHandler) resolveBusinessID(c *gin.Context) (uint, bool) {
	scope, ok := h.scopeBusinessID(c)
	if !ok {
		return 0, false
	}
	if scope == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "business_id requerido",
			Error:   "Los super administradores deben enviar business_id en el query param",
		})
		return 0, false
	}
	return scope, true
}

// scopeBusinessID devuelve el alcance del usuario: su business_id, o el ?business_id= del
// super admin (0 = sin restricción, solo para super admin sin parámetro).
func (h *CommonAreaHandler) scopeBusinessID(c *gin.Context) (uint, bool) {
	if middleware.IsSuperAdmin(c) {
		raw := c.Query("business_id")
		if raw == "" {
			return 0, true
		}
		id, err := strconv.ParseUint(raw, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "business_id inválido",
				Error:   "Debe ser numérico",
			})
			return 0, false
		}
		return uint(id), true
	}

	businessID, exists := middleware.GetBusinessID(c)
	if !exists || businessID == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return 0, false
	}
	return businessID, true
}

func inScope(scope, resourceBusinessID uint) bool {
	return scope == 0 || scope == resourceBusinessID
}

func parseIDParam(c *gin.Context, name string) (uint, bool) {
	id, err := strconv.ParseUint(c.Param(name), 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return 0, false
	}
	return uint(id), true
}

// loadAreaInScope obtiene la zona :id y verifica que pertenezca al alcance del usuario.
func (h *CommonAreaHandler) loadAreaInScope(c *gin.Context, id uint) (*domain.CommonArea, bool) {
	scope, ok := h.scopeBusinessID(c)
	if !ok {
		return nil, false
	}
	area, err := h.useCase.GetCommonAreaByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrCommonAreaNotFound) {
			c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "Zona común no encontrada"})
			return nil, false
		}
		h.logger.Error(c.Request.Context()).Err(err).Msg("Error obteniendo zona común")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo zona común", Error: err.Error()})
		return nil, false
	}
	if !inScope(scope, area.BusinessID) {
		c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "Zona común no encontrada"})
		return nil, false
	}
	return area, true
}

// loadReservationInScope obtiene la reserva :id y verifica que pertenezca al alcance del usuario.
func (h *CommonAreaHandler) loadReservationInScope(c *gin.Context, id uint) (*domain.CommonAreaReservation, bool) {
	scope, ok := h.scopeBusinessID(c)
	if !ok {
		return nil, false
	}
	reservation, err := h.useCase.GetReservationByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrReservationNotFound) {
			c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "Reserva no encontrada"})
			return nil, false
		}
		h.logger.Error(c.Request.Context()).Err(err).Msg("Error obteniendo reserva")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo reserva", Error: err.Error()})
		return nil, false
	}
	if !inScope(scope, reservation.BusinessID) {
		c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "Reserva no encontrada"})
		return nil, false
	}
	return reservation, true
}

// writeUseCaseError traduce errores de negocio a 400/404 y el resto a 500.
func (h *CommonAreaHandler) writeUseCaseError(c *gin.Context, err error, message string) {
	switch {
	case errors.Is(err, domain.ErrCommonAreaNotFound), errors.Is(err, domain.ErrReservationNotFound), errors.Is(err, domain.ErrRestrictionNotFound):
		c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: err.Error()})
	case errors.Is(err, domain.ErrInvalidSchedule), errors.Is(err, domain.ErrInvalidRestriction),
		errors.Is(err, domain.ErrReservationNotAvailable), errors.Is(err, domain.ErrExceedsCapacity),
		errors.Is(err, domain.ErrScheduleNotConfigured), errors.Is(err, domain.ErrRestrictionActive),
		errors.Is(err, domain.ErrOutsideSchedule), errors.Is(err, domain.ErrCommonAreaInactive):
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: err.Error()})
	default:
		h.logger.Error(c.Request.Context()).Err(err).Msg(message)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: message, Error: err.Error()})
	}
}
