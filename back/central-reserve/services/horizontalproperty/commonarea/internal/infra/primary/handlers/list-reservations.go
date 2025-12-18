package handlers

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ListReservations lista reservas
func (h *CommonAreaHandler) ListReservations(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListReservations")

	var req request.ListReservationsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Parámetros inválidos",
			Error:   err.Error(),
		})
		return
	}

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	filters := domain.ReservationFiltersDTO{
		BusinessID:          businessID,
		CommonAreaID:        req.CommonAreaID,
		PropertyUnitID:      req.PropertyUnitID,
		ResidentID:          req.ResidentID,
		ReservationStatusID: req.ReservationStatusID,
		StartDate:           req.StartDate,
		EndDate:             req.EndDate,
		Page:                req.Page,
		PageSize:            req.PageSize,
	}

	result, err := h.useCase.ListReservations(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando reservas")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando reservas",
			Error:   err.Error(),
		})
		return
	}

	reservations := make([]response.ReservationListResponse, len(result.Reservations))
	for i, res := range result.Reservations {
		reservations[i] = response.ReservationListResponse{
			ID:                 res.ID,
			CommonAreaName:     res.CommonAreaName,
			PropertyUnitNumber: res.PropertyUnitNumber,
			ResidentName:       res.ResidentName,
			StatusName:         res.StatusName,
			ReservationDate:    res.ReservationDate,
			StartTime:          res.StartTime,
			EndTime:            res.EndTime,
			NumberOfGuests:     res.NumberOfGuests,
			CreatedAt:          res.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedReservationsResponse{
		Success:    true,
		Data:       reservations,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
