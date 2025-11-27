package handlers

import (
	"fmt"
	"net/http"
	"os"

	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/mapper"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"
	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// GetPublicVotingInfo godoc
//
//	@Summary		Obtener información de votación (pública)
//	@Description	Obtiene toda la información de la votación usando solo el VOTING_AUTH_TOKEN. Incluye título, descripción, opciones, etc.
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		json
//	@Param			Authorization	header	string	true	"Token de autenticación de votación (Bearer token)"
//	@Success		200				{object}	object
//	@Failure		401				{object}	object
//	@Failure		404				{object}	object
//	@Failure		500				{object}	object
//	@Router			/public/voting-info [get]
func (h *VotingHandler) GetPublicVotingInfo(c *gin.Context) {

	// Obtener y validar token de autenticación de votación
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-public-voting-info.go - Token no proporcionado\n")
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
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-public-voting-info.go - Token inválido: %v\n", err)
		h.logger.Error().Err(err).Msg("Token de autenticación de votación inválido")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de autenticación inválido",
			Error:   err.Error(),
		})
		return
	}

	// Extraer toda la información del token
	votingID := authClaims.VotingID
	groupID := authClaims.VotingGroupID
	hpID := authClaims.HPID
	residentID := authClaims.ResidentID

	fmt.Printf("\n📊 [VOTACION PUBLICA - OBTENIENDO INFO]\n")
	fmt.Printf("   Token de autenticación válido\n")
	fmt.Printf("   Residente ID: %d\n", residentID)
	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Grupo ID: %d\n", groupID)
	fmt.Printf("   Votación ID: %d\n\n", votingID)

	// Obtener información completa de la votación (con opciones)
	voting, err := h.votingUseCase.GetVotingByID(c.Request.Context(), hpID, groupID, votingID)
	if err != nil {
		status := http.StatusInternalServerError
		message := "Error obteniendo información de la votación"

		// Manejar error específico
		if err.Error() == "votación no encontrada" {
			status = http.StatusNotFound
			message = "Votación no encontrada"
		}

		fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-public-voting-info.go - Error obteniendo votación: voting_id=%d, error=%v\n", votingID, err)
		h.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error obteniendo información de votación")
		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: message,
			Error:   err.Error(),
		})
		return
	}

	// Obtener la unidad principal del residente
	propertyUnitID, err := h.votingRepository.GetResidentMainUnitID(c.Request.Context(), residentID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-public-voting-info.go - Error obteniendo unidad principal: %v\n", err)
		h.logger.Error().Err(err).Uint("resident_id", residentID).Msg("Error obteniendo unidad principal del residente")
		// No retornamos error, solo asumimos que no ha votado
		propertyUnitID = 0
	}

	// Verificar si la unidad ya votó y obtener su voto
	hasVoted, err := h.votingUseCase.HasUnitVoted(c.Request.Context(), votingID, propertyUnitID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-public-voting-info.go - Error verificando si votó: property_unit_id=%d, voting_id=%d, error=%v\n", propertyUnitID, votingID, err)
		h.logger.Error().Err(err).Uint("property_unit_id", propertyUnitID).Uint("voting_id", votingID).Msg("Error verificando si unidad ya votó")
		// No retornamos error, solo asumimos que no ha votado
		hasVoted = false
	}

	// Si ya votó, obtener información del voto y resultados
	var myVote *response.VoteResponse
	var results []response.VotingResultResponse

	if hasVoted {
		fmt.Printf("📊 [VOTACION PUBLICA - OBTENIENDO VOTO Y RESULTADOS]\n")

		// Obtener el voto de la unidad
		vote, err := h.votingUseCase.GetUnitVote(c.Request.Context(), votingID, propertyUnitID)
		if err != nil {
			fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-public-voting-info.go - Error obteniendo voto del residente: %v\n", err)
			fmt.Printf("   ❌ Error obteniendo mi voto: %v\n", err)
		} else if vote != nil {
			myVoteData := mapper.MapVoteDTOToResponse(vote)
			myVote = &myVoteData
			fmt.Printf("   ✅ Mi voto obtenido: Opción ID=%d, Texto='%s'\n", vote.VotingOptionID, vote.OptionText)
		}

		// Obtener resultados de la votación
		fmt.Printf("   Obteniendo resultados de votación ID=%d...\n", votingID)
		votingResults, err := h.votingUseCase.GetVotingResults(c.Request.Context(), votingID)
		if err != nil {
			fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-public-voting-info.go - Error obteniendo resultados: %v\n", err)
			fmt.Printf("   ❌ Error obteniendo resultados: %v\n", err)
		} else {
			fmt.Printf("   ✅ Resultados obtenidos: %d opciones con votos\n", len(votingResults))
			for i, result := range votingResults {
				fmt.Printf("      [%d] Opción '%s': %d votos (%.1f%%)\n", i+1, result.OptionText, result.VoteCount, result.Percentage)
			}
			results = mapper.MapVotingResultsToResponses(votingResults)
		}
		fmt.Printf("\n")
	}

	// Mapear a response
	votingResponse := mapper.MapVotingDTOToResponse(voting)
	optionsResponse := mapper.MapVotingOptionDTOsToResponses(voting.Options)

	fmt.Printf("✅ [VOTACION PUBLICA - INFO OBTENIDA]\n")
	fmt.Printf("   Título: %s\n", voting.Title)
	fmt.Printf("   Tipo: %s\n", voting.VotingType)
	fmt.Printf("   Es secreta: %t\n", voting.IsSecret)
	fmt.Printf("   Permite abstención: %t\n", voting.AllowAbstention)
	fmt.Printf("   Activa: %t\n", voting.IsActive)
	fmt.Printf("   Opciones disponibles: %d\n", len(voting.Options))
	fmt.Printf("   Ya votó: %t\n", hasVoted)
	if hasVoted && myVote != nil {
		fmt.Printf("   Opción votada: %s (%s)\n", myVote.OptionText, myVote.OptionCode)
		fmt.Printf("   Total de votos: %d\n", len(results))
	}
	fmt.Printf("\n")

	h.logger.Info().
		Uint("voting_id", votingID).
		Uint("voting_group_id", groupID).
		Uint("hp_id", hpID).
		Uint("resident_id", residentID).
		Str("voting_title", voting.Title).
		Str("voting_type", voting.VotingType).
		Int("options_count", len(voting.Options)).
		Bool("has_voted", hasVoted).
		Msg("✅ [VOTACION PUBLICA] Información de votación obtenida exitosamente")

	responseData := gin.H{
		"voting":          votingResponse,
		"options":         optionsResponse,
		"has_voted":       hasVoted,
		"hp_id":           hpID,
		"voting_group_id": groupID,
		"resident_id":     residentID,
	}

	// Agregar voto y resultados si ya votó
	if hasVoted {
		responseData["my_vote"] = myVote
		responseData["results"] = results
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Información de votación obtenida exitosamente",
		"data":    responseData,
	})
}
