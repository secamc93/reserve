package handlers

import (
	"net/http"
	"strconv"
	"time"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/dashboard/internal/domain"
	"central_reserve/services/horizontalproperty/dashboard/internal/infra/primary/handlers/response"

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

// GetToday godoc
//
//	@Summary		Resumen de hoy de la propiedad
//	@Description	Visitas dentro ahora, paquetes por entregar, reservas de zonas comunes de hoy, la votación activa y la ocupación. Usuario normal: la propiedad del token. Super admin: ?business_id o la propiedad de su token.
//	@Tags			Dashboard
//	@Security		BearerAuth
//	@Produce		json
//	@Param			business_id	query		int	false	"Propiedad (super admin)"
//	@Success		200			{object}	response.TodayResponse
//	@Failure		400			{object}	response.ErrorResponse
//	@Failure		401			{object}	response.ErrorResponse
//	@Router			/dashboard/today [get]
func (h *DashboardHandler) GetToday(c *gin.Context) {
	businessID, _ := middleware.GetBusinessID(c)
	if middleware.IsSuperAdmin(c) {
		if q := c.Query("business_id"); q != "" {
			id, err := strconv.ParseUint(q, 10, 32)
			if err != nil || id == 0 {
				c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Error: "business_id inválido"})
				return
			}
			businessID = uint(id)
		}
	}
	if businessID == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Error: domain.ErrBusinessRequired.Error()})
		return
	}

	t, err := h.dashboardUseCase.GetToday(c.Request.Context(), businessID, propertyToday())
	if err != nil {
		h.logger.Error(c.Request.Context()).Err(err).Uint("business_id", businessID).Msg("Error obteniendo resumen de hoy")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo resumen de hoy", Error: err.Error()})
		return
	}

	out := response.TodayResponse{
		VisitsInside:        make([]response.InsideVisitResponse, 0, len(t.VisitsInside)),
		VisitsInsideCount:   t.VisitsInsideCount,
		VisitsExceededCount: t.VisitsExceededCount,
		PackagesPending:     t.PackagesPending,
		PackagesOld:         t.PackagesOld,
		ReservationsToday:   make([]response.TodayReservationResponse, 0, len(t.ReservationsToday)),
		ReservationsPending: t.ReservationsPending,
		Occupancy: response.OccupancyResponse{
			Units: t.Occupancy.Units, UnitsWithResident: t.Occupancy.UnitsWithResident,
			ParkingSlots: t.Occupancy.ParkingSlots, ParkingAssigned: t.Occupancy.ParkingAssigned,
			Residents: t.Occupancy.Residents, ResidentsWithEmail: t.Occupancy.ResidentsWithEmail,
		},
	}
	for _, v := range t.VisitsInside {
		out.VisitsInside = append(out.VisitsInside, response.InsideVisitResponse{
			VisitorName: v.VisitorName, VisitType: v.VisitType, UnitNumber: v.UnitNumber, UnitBlock: v.UnitBlock, EntryTime: v.EntryTime, Exceeded: v.Exceeded,
		})
	}
	for _, r := range t.ReservationsToday {
		out.ReservationsToday = append(out.ReservationsToday, response.TodayReservationResponse{
			StartTime: r.StartTime, EndTime: r.EndTime, AreaName: r.AreaName, UnitNumber: r.UnitNumber, UnitBlock: r.UnitBlock, Approved: r.Approved,
		})
	}
	if av := t.ActiveVoting; av != nil {
		out.ActiveVoting = &response.ActiveVotingResponse{
			GroupID: av.GroupID, GroupName: av.GroupName, VotingID: av.VotingID, Title: av.Title,
			VotedUnits: av.VotedUnits, TotalUnits: av.TotalUnits, QuorumPercentage: av.QuorumPercentage, AttendanceByCoef: av.AttendanceByCoef,
		}
	}
	c.JSON(http.StatusOK, response.SuccessResponse[response.TodayResponse]{Success: true, Message: "Resumen de hoy", Data: out})
}
