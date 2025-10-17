package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// GetUnvotedUnitsByVoting obtiene las unidades que no han votado en una votación específica
// @Summary		Obtener unidades sin votar
// @Description	Obtiene la lista de unidades que no han votado en una votación específica, útil para formularios de votación. Permite filtrar por número de unidad.
// @Tags			Voting
// @Accept			json
// @Produce		json
// @Param			hp_id		path		uint	true	"ID de la propiedad horizontal"
// @Param			group_id	path		uint	true	"ID del grupo de votación"
// @Param			voting_id	path		uint	true	"ID de la votación"
// @Param			unit_number	query		string	false	"Filtrar por número de unidad (ej: '15' encuentra todas las unidades con 15, 'casa 15' encuentra CASA 15, CASA 150, etc.)"
// @Success		200			{object}	object
// @Failure		400			{object}	object
// @Failure		404			{object}	object
// @Failure		500			{object}	object
// @Security		BearerAuth
// @Router			/horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id}/unvoted-units [get]
func (h *VotingHandler) GetUnvotedUnitsByVoting(c *gin.Context) {
	// Obtener parámetros de la URL
	hpIDParam := c.Param("hp_id")
	hpID, err := strconv.ParseUint(hpIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-unvoted-units-by-voting.go - Error parseando hp_id: %v\n", err)
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de propiedad horizontal inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	groupIDParam := c.Param("group_id")
	groupID, err := strconv.ParseUint(groupIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-unvoted-units-by-voting.go - Error parseando group_id: %v\n", err)
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de grupo de votación inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	votingIDParam := c.Param("voting_id")
	votingID, err := strconv.ParseUint(votingIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-unvoted-units-by-voting.go - Error parseando voting_id: %v\n", err)
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de votación inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	// Obtener query parameter de número de unidad
	unitNumberFilter := c.Query("unit_number")

	fmt.Printf("\n📋 [UNIDADES SIN VOTAR] Consultando unidades disponibles\n")
	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Grupo ID: %d\n", groupID)
	fmt.Printf("   Votación ID: %d\n", votingID)
	if unitNumberFilter != "" {
		fmt.Printf("   Filtro por unidad: %s\n", unitNumberFilter)
	}
	fmt.Printf("\n")

	// Verificar que la votación existe y pertenece al grupo
	voting, err := h.votingUseCase.GetVotingByID(c.Request.Context(), uint(hpID), uint(groupID), uint(votingID))
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-unvoted-units-by-voting.go - Error obteniendo votación: %v\n", err)
		c.JSON(http.StatusNotFound, response.ErrorResponse{
			Success: false,
			Message: "Votación no encontrada",
			Error:   err.Error(),
		})
		return
	}

	// Obtener unidades sin votar
	unvotedUnits, err := h.votingUseCase.GetUnvotedUnitsByVoting(c.Request.Context(), uint(votingID), unitNumberFilter)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-unvoted-units-by-voting.go - Error obteniendo unidades sin votar: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", uint(votingID)).Msg("Error obteniendo unidades sin votar")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo unidades sin votar",
			Error:   err.Error(),
		})
		return
	}

	// Convertir a response DTOs
	responseUnits := make([]response.UnvotedUnitResponse, len(unvotedUnits))
	for i, unit := range unvotedUnits {
		responseUnits[i] = response.UnvotedUnitResponse{
			UnitID:       unit.UnitID,
			UnitNumber:   unit.UnitNumber,
			ResidentID:   unit.ResidentID,
			ResidentName: unit.ResidentName,
		}
	}

	fmt.Printf("📊 [UNIDADES SIN VOTAR] Resultados obtenidos\n")
	fmt.Printf("   Votación: %s\n", voting.Title)
	fmt.Printf("   Unidades disponibles: %d\n\n", len(responseUnits))

	c.JSON(http.StatusOK, response.UnvotedUnitsSuccess{
		Success: true,
		Message: "Unidades sin votar obtenidas exitosamente",
		Data:    responseUnits,
	})
}
