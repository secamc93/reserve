package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// propertyToday es la fecha de hoy en la zona horaria de las propiedades (America/Bogota).
func propertyToday() time.Time {
	loc, err := time.LoadLocation("America/Bogota")
	if err != nil {
		loc = time.FixedZone("COT", -5*3600)
	}
	now := time.Now().In(loc)
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc)
}

func assignmentResponse(a *domain.ParkingAssignment) response.ParkingAssignmentResponse {
	return response.ParkingAssignmentResponse{
		ID:             a.ID,
		BusinessID:     a.BusinessID,
		ParkingSlotID:  a.ParkingSlotID,
		PropertyUnitID: a.PropertyUnitID,
		ResidentID:     a.ResidentID,
		VehiclePlate:   a.VehiclePlate,
		VehicleBrand:   a.VehicleBrand,
		VehicleModel:   a.VehicleModel,
		VehicleColor:   a.VehicleColor,
		StartDate:      a.StartDate,
		EndDate:        a.EndDate,
		IsActive:       a.IsActive,
		Notes:          a.Notes,
		CreatedAt:      a.CreatedAt,
		UpdatedAt:      a.UpdatedAt,
	}
}

func assignmentError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, domain.ErrParkingAssignmentNotFound):
		c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "Asignación no encontrada", Error: err.Error()})
	case errors.Is(err, domain.ErrParkingAssignmentInactive):
		c.JSON(http.StatusConflict, response.ErrorResponse{Success: false, Message: "La asignación ya fue liberada", Error: err.Error()})
	case errors.Is(err, domain.ErrInvalidVehiclePlate), errors.Is(err, domain.ErrInvalidTimeRange):
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error en la asignación", Error: err.Error()})
	}
}

func assignmentParams(c *gin.Context) (uint, uint, bool) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID inválido"})
		return 0, 0, false
	}
	businessID, ok := middleware.GetBusinessID(c)
	if !ok || businessID == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "business_id no disponible"})
		return 0, 0, false
	}
	return uint(id), businessID, true
}

// UpdateParkingAssignment godoc
//
//	@Summary		Editar asignación de parqueadero
//	@Description	Edita el vehículo, la fecha de fin (null = indefinida) y las notas de una asignación activa de la propiedad del token.
//	@Tags			Parqueaderos
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			id		path		int										true	"ID de la asignación"
//	@Param			request	body		request.UpdateParkingAssignmentRequest	true	"Datos"
//	@Success		200		{object}	object
//	@Failure		400		{object}	response.ErrorResponse
//	@Failure		404		{object}	response.ErrorResponse
//	@Failure		409		{object}	response.ErrorResponse
//	@Router			/horizontal-properties/parking/assignments/{id} [put]
func (h *ParkingHandler) UpdateParkingAssignment(c *gin.Context) {
	id, businessID, ok := assignmentParams(c)
	if !ok {
		return
	}
	var req request.UpdateParkingAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	a, err := h.useCase.UpdateParkingAssignment(c.Request.Context(), domain.UpdateParkingAssignmentDTO{
		BusinessID:   businessID,
		ID:           id,
		VehiclePlate: req.VehiclePlate,
		VehicleBrand: req.VehicleBrand,
		VehicleModel: req.VehicleModel,
		VehicleColor: req.VehicleColor,
		EndDate:      req.EndDate,
		Notes:        req.Notes,
	})
	if err != nil {
		assignmentError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Asignación actualizada", "data": assignmentResponse(a)})
}

// ReleaseParkingAssignment godoc
//
//	@Summary		Liberar cupo
//	@Description	Libera el cupo: la asignación queda inactiva con fecha de fin hoy (historial) y el cupo queda libre.
//	@Tags			Parqueaderos
//	@Security		BearerAuth
//	@Produce		json
//	@Param			id	path		int	true	"ID de la asignación"
//	@Success		200	{object}	object
//	@Failure		404	{object}	response.ErrorResponse
//	@Failure		409	{object}	response.ErrorResponse
//	@Router			/horizontal-properties/parking/assignments/{id}/release [post]
func (h *ParkingHandler) ReleaseParkingAssignment(c *gin.Context) {
	id, businessID, ok := assignmentParams(c)
	if !ok {
		return
	}
	a, err := h.useCase.ReleaseParkingAssignment(c.Request.Context(), businessID, id, propertyToday())
	if err != nil {
		assignmentError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Cupo liberado", "data": assignmentResponse(a)})
}

// GetParkingAssignmentsSummary godoc
//
//	@Summary		Resumen de asignaciones
//	@Description	Conteos de asignaciones vigentes, que vencen en 30 días, vencidas y unidades sin cupo.
//	@Tags			Parqueaderos
//	@Security		BearerAuth
//	@Produce		json
//	@Success		200	{object}	response.ParkingAssignmentSummaryResponse
//	@Router			/horizontal-properties/parking/assignments/summary [get]
func (h *ParkingHandler) GetParkingAssignmentsSummary(c *gin.Context) {
	businessID, ok := middleware.GetBusinessID(c)
	if !ok || businessID == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "business_id no disponible"})
		return
	}
	s, err := h.useCase.GetParkingAssignmentSummary(c.Request.Context(), businessID, propertyToday())
	if err != nil {
		h.logger.Error(c.Request.Context()).Err(err).Msg("Error obteniendo resumen de asignaciones")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo resumen", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": response.ParkingAssignmentSummaryResponse{
		Active: s.Active, Expiring30: s.Expiring30, Expired: s.Expired, UnitsWithoutSlot: s.UnitsWithoutSlot,
	}})
}
