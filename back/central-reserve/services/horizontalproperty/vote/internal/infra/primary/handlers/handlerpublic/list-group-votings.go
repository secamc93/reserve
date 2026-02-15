package handlerpublic

import (
	"fmt"
	"net/http"
	"os"

	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"
	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// ListGroupVotings godoc
//
//	@Summary		Listar votaciones de un grupo (público)
//	@Description	Obtiene todas las votaciones de un grupo con información de si la unidad ya votó en cada una
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		json
//	@Param			Authorization	header	string	true	"Token de autenticación de votación (Bearer token)"
//	@Success		200				{object}	object
//	@Failure		401				{object}	object
//	@Failure		404				{object}	object
//	@Failure		500				{object}	object
//	@Router			/public/voting-group/votings [get]
func (h *PublicHandler) ListGroupVotings(c *gin.Context) {
	// Obtener y validar token de autenticación de votación
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/list-group-votings.go - Token no proporcionado\n")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de autenticación requerido",
			Error:   "Debe proporcionar el token de autenticación de votación",
		})
		return
	}

	// Extraer token (remover "Bearer ")
	tokenString := authHeader
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		tokenString = authHeader[7:]
	}

	jwtService := sharedjwt.New(h.jwtSecret)
	authClaims, err := jwtService.ValidateVotingAuthToken(tokenString)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/list-group-votings.go - Token inválido: %v\n", err)
		h.logger.Error().Err(err).Msg("Token de autenticación de votación inválido")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de autenticación inválido",
			Error:   err.Error(),
		})
		return
	}

	// Extraer información del token
	groupID := authClaims.VotingGroupID
	hpID := authClaims.HPID
	propertyUnitID := authClaims.PropertyUnitID
	residentID := authClaims.ResidentID

	fmt.Printf("\n📊 [GRUPO DE VOTACION - LISTADO]\n")
	fmt.Printf("   Token de autenticación válido\n")
	fmt.Printf("   Residente ID: %d\n", residentID)
	fmt.Printf("   Unidad ID: %d\n", propertyUnitID)
	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Grupo ID: %d\n\n", groupID)

	// Obtener información del grupo
	group, err := h.votingGroupsUseCase.GetVotingGroupByID(c.Request.Context(), groupID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/list-group-votings.go - Error obteniendo grupo: %v\n", err)
		h.logger.Error().Err(err).Uint("group_id", groupID).Msg("Error obteniendo grupo de votación")
		c.JSON(http.StatusNotFound, response.ErrorResponse{
			Success: false,
			Message: "Grupo de votación no encontrado",
			Error:   err.Error(),
		})
		return
	}

	// Obtener votaciones del grupo con estado de voto
	votings, err := h.publicUseCase.ListVotingsByGroupWithVoteStatus(c.Request.Context(), groupID, propertyUnitID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/list-group-votings.go - Error obteniendo votaciones: %v\n", err)
		h.logger.Error().Err(err).Uint("group_id", groupID).Msg("Error obteniendo votaciones del grupo")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo votaciones del grupo",
			Error:   err.Error(),
		})
		return
	}

	// Mapear votaciones a response con JSON tags correctos
	votingResponses := make([]response.VotingWithStatusResponse, len(votings))
	activeCount := 0
	userVotesCount := 0
	for i, v := range votings {
		votingResponses[i] = response.VotingWithStatusResponse{
			ID:                 v.ID,
			VotingGroupID:      v.VotingGroupID,
			Title:              v.Title,
			Description:        v.Description,
			VotingType:         v.VotingType,
			IsSecret:           v.IsSecret,
			AllowAbstention:    v.AllowAbstention,
			IsActive:           v.IsActive,
			DisplayOrder:       v.DisplayOrder,
			RequiredPercentage: v.RequiredPercentage,
			OptionsCount:       v.OptionsCount,
			HasVoted:           v.HasVoted,
		}
		if v.IsActive {
			activeCount++
		}
		if v.HasVoted {
			userVotesCount++
		}
	}

	fmt.Printf("✅ [GRUPO DE VOTACION - LISTADO OBTENIDO]\n")
	fmt.Printf("   Grupo: %s\n", group.Name)
	fmt.Printf("   Total votaciones: %d\n", len(votings))
	fmt.Printf("   Votaciones activas: %d\n", activeCount)
	fmt.Printf("   Votos del usuario: %d\n\n", userVotesCount)

	h.logger.Info().
		Uint("group_id", groupID).
		Uint("hp_id", hpID).
		Uint("resident_id", residentID).
		Uint("property_unit_id", propertyUnitID).
		Int("total_votings", len(votings)).
		Int("active_votings", activeCount).
		Int("user_votes", userVotesCount).
		Msg("✅ [GRUPO PUBLICO] Votaciones del grupo obtenidas exitosamente")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Votaciones del grupo obtenidas exitosamente",
		"data": gin.H{
			"voting_group": gin.H{
				"id":                 group.ID,
				"name":               group.Name,
				"description":        group.Description,
				"voting_start_date":  group.VotingStartDate,
				"voting_end_date":    group.VotingEndDate,
				"is_active":          group.IsActive,
				"requires_quorum":    group.RequiresQuorum,
				"quorum_percentage":  group.QuorumPercentage,
			},
			"votings":          votingResponses,
			"total_votings":    len(votings),
			"active_votings":   activeCount,
			"user_votes_count": userVotesCount,
		},
	})
}
