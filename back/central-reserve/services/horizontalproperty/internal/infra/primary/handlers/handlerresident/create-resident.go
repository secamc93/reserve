package handlerresident

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/response"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CreateResident godoc
//
//	@Summary		Crear residente
//	@Description	Crea un nuevo residente en una propiedad horizontal
//	@Tags			Residents
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			hp_id		path		int								true	"ID de la propiedad horizontal"
//	@Param			resident	body		request.CreateResidentRequest	true	"Datos del residente"
//	@Success		201			{object}	object
//	@Failure		400			{object}	object
//	@Failure		409			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/{hp_id}/residents [post]
func (h *ResidentHandler) CreateResident(c *gin.Context) {
	hpIDParam := c.Param("hp_id")
	hpID, err := strconv.ParseUint(hpIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerresident/create-resident.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("hp_id", hpIDParam).Msg("Error parseando ID de propiedad horizontal")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID inválido", Error: "Debe ser numérico"})
		return
	}
	var req request.CreateResidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerresident/create-resident.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	dto := mapper.MapCreateRequestToDTO(req, uint(hpID))
	created, err := h.useCase.CreateResident(c.Request.Context(), dto)
	if err != nil {
		status := http.StatusInternalServerError
		if err == domain.ErrResidentEmailExists || err == domain.ErrResidentDniExists {
			status = http.StatusConflict
		} else if err == domain.ErrResidentNameRequired || err == domain.ErrResidentEmailRequired || err == domain.ErrResidentDniRequired {
			status = http.StatusBadRequest
		}
		fmt.Fprintf(os.Stderr, "[ERROR] handlerresident/create-resident.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("hp_id", uint(hpID)).Str("email", req.Email).Str("dni", req.Dni).Msg("Error creando residente")
		c.JSON(status, response.ErrorResponse{Success: false, Message: "No se pudo crear el residente", Error: err.Error()})
		return
	}
	responseData := mapper.MapDetailDTOToResponse(created)
	c.JSON(http.StatusCreated, response.ResidentSuccess{Success: true, Message: "Residente creado exitosamente", Data: responseData})
}
