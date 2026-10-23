package handlers

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/membership/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// Grant godoc
//
//	@Summary		Otorgar una membresía (super admin)
//	@Description	manual (pagada por fuera) o cortesia (regalada). plan_code CUSTOM con max_properties para acuerdos especiales
//	@Tags			Membresías
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			body	body		request.GrantRequest	true	"Plan, conjuntos, origen y notas"
//	@Success		201		{object}	response.Success
//	@Router			/horizontal-properties/memberships/grant [post]
func (h *handler) Grant(c *gin.Context) {
	if !middleware.IsSuperAdmin(c) {
		c.JSON(http.StatusForbidden, response.ErrorResponse{Success: false, Message: "Solo el super admin puede hacer esto"})
		return
	}
	userID, ok := currentUser(c)
	if !ok {
		return
	}
	var req request.GrantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}
	m, err := h.useCase.Grant(c.Request.Context(), dtos.GrantRequest{
		PlanCode: req.PlanCode, MaxProperties: req.MaxProperties, BusinessIDs: req.BusinessIDs, Source: req.Source,
		Notes: req.Notes, OwnerUserID: req.OwnerUserID, ByUserID: &userID,
	})
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, response.Success{Success: true, Message: "Membresía otorgada", Data: mappers.ToMembership(*m)})
}
