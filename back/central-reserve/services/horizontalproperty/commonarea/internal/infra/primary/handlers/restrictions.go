package handlers

import (
	"net/http"
	"time"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ListRestrictions lista los bloqueos vigentes o futuros de una zona
func (h *CommonAreaHandler) ListRestrictions(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ListRestrictions")

	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}
	if _, ok := h.loadAreaInScope(c, id); !ok {
		return
	}
	today := time.Now().Truncate(24 * time.Hour)
	restrictions, err := h.useCase.ListRestrictions(ctx, id, today)
	if err != nil {
		h.writeUseCaseError(c, err, "Error listando restricciones")
		return
	}
	data := make([]response.RestrictionResponse, len(restrictions))
	for i, r := range restrictions {
		data[i] = mappers.RestrictionToResponse(r)
	}
	c.JSON(http.StatusOK, response.SuccessResponse{Success: true, Data: data})
}

// CreateRestriction bloquea una zona en un rango de fechas
func (h *CommonAreaHandler) CreateRestriction(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "CreateRestriction")

	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}
	var req request.CreateRestrictionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	startDate, err1 := time.Parse("2006-01-02", req.StartDate)
	endDate, err2 := time.Parse("2006-01-02", req.EndDate)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Las fechas deben tener formato YYYY-MM-DD"})
		return
	}
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "user_id no disponible"})
		return
	}
	if _, ok := h.loadAreaInScope(c, id); !ok {
		return
	}

	restriction, err := h.useCase.CreateRestriction(ctx, domain.CreateRestrictionDTO{
		CommonAreaID:    id,
		RestrictionType: req.RestrictionType,
		StartDate:       startDate,
		EndDate:         endDate,
		StartTime:       emptyToNil(req.StartTime),
		EndTime:         emptyToNil(req.EndTime),
		Reason:          req.Reason,
		CreatedByUserID: userID,
	})
	if err != nil {
		h.writeUseCaseError(c, err, "Error creando restricción")
		return
	}
	c.JSON(http.StatusCreated, response.SuccessResponse{Success: true, Message: "Restricción creada", Data: mappers.RestrictionToResponse(restriction)})
}

// DeleteRestriction elimina un bloqueo de la zona
func (h *CommonAreaHandler) DeleteRestriction(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "DeleteRestriction")

	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}
	restrictionID, ok := parseIDParam(c, "restrictionId")
	if !ok {
		return
	}
	if _, ok := h.loadAreaInScope(c, id); !ok {
		return
	}
	if err := h.useCase.DeleteRestriction(ctx, id, restrictionID); err != nil {
		h.writeUseCaseError(c, err, "Error eliminando restricción")
		return
	}
	c.JSON(http.StatusOK, response.SuccessResponse{Success: true, Message: "Restricción eliminada"})
}

func emptyToNil(v *string) *string {
	if v == nil || *v == "" {
		return nil
	}
	return v
}
