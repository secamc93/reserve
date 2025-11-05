package handlervote

import (
	"fmt"
	"net/http"
	"os"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// GetPublicVotingContext godoc
//
//	@Summary		Obtener contexto de votación pública
//	@Description	Obtiene el nombre de la votación y la propiedad horizontal usando el token público. Se muestra antes de la validación del residente.
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		json
//	@Param			Authorization	header	string	true	"Token de votación pública (Bearer token)"
//	@Success		200				{object}	object
//	@Failure		401				{object}	object
//	@Failure		404				{object}	object
//	@Failure		500				{object}	object
//	@Router			/public/voting-context [get]
func (h *VotingHandler) GetPublicVotingContext(c *gin.Context) {

	// Obtener y validar token de votación pública
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-voting-context.go - Token no proporcionado\n")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de votación requerido",
			Error:   "Debe proporcionar el token de votación pública",
		})
		return
	}

	// Extraer token (remover "Bearer ")
	tokenString := authHeader
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		tokenString = authHeader[7:]
	}

	jwtService := sharedjwt.New(h.jwtSecret)
	publicClaims, err := jwtService.ValidatePublicVotingToken(tokenString)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-voting-context.go - Token inválido: %v\n", err)
		h.logger.Error().Err(err).Msg("Token de votación pública inválido")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de votación inválido",
			Error:   err.Error(),
		})
		return
	}

	// Extraer información del token
	hpID := publicClaims.HPID
	votingID := publicClaims.VotingID
	groupID := publicClaims.VotingGroupID

	fmt.Printf("\n🏢 [VOTACION PUBLICA - OBTENIENDO CONTEXTO]\n")
	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Voting Group ID: %d\n", groupID)
	fmt.Printf("   Voting ID: %d\n\n", votingID)

	// Obtener información de la propiedad horizontal
	hp, err := h.horizontalPropertyUseCase.GetHorizontalPropertyByID(c.Request.Context(), hpID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-voting-context.go - Error obteniendo HP: hp_id=%d, error=%v\n", hpID, err)
		h.logger.Error().Err(err).Uint("hp_id", hpID).Msg("Error obteniendo propiedad horizontal")
		c.JSON(http.StatusNotFound, response.ErrorResponse{
			Success: false,
			Message: "Propiedad horizontal no encontrada",
			Error:   err.Error(),
		})
		return
	}

	// Obtener información de la votación
	voting, err := h.votingUseCase.GetVotingByID(c.Request.Context(), hpID, groupID, votingID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-voting-context.go - Error obteniendo votación: voting_id=%d, error=%v\n", votingID, err)
		h.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error obteniendo votación")
		c.JSON(http.StatusNotFound, response.ErrorResponse{
			Success: false,
			Message: "Votación no encontrada",
			Error:   err.Error(),
		})
		return
	}

	// Obtener información del grupo de votación
	group, err := h.votingUseCase.GetVotingGroupByID(c.Request.Context(), groupID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-voting-context.go - Error obteniendo grupo: group_id=%d, error=%v\n", groupID, err)
		h.logger.Error().Err(err).Uint("group_id", groupID).Msg("Error obteniendo grupo de votación")
		// No es crítico, continuamos sin la info del grupo
	}

	fmt.Printf("✅ [VOTACION PUBLICA - CONTEXTO OBTENIDO]\n")
	fmt.Printf("   Propiedad: %s\n", hp.Name)
	fmt.Printf("   Votación: %s\n", voting.Title)
	if group != nil {
		fmt.Printf("   Grupo: %s\n", group.Name)
	}
	fmt.Printf("\n")

	h.logger.Info().
		Uint("hp_id", hpID).
		Uint("voting_id", votingID).
		Str("hp_name", hp.Name).
		Str("voting_title", voting.Title).
		Msg("✅ [VOTACION PUBLICA] Contexto obtenido exitosamente")

	responseData := gin.H{
		"property": gin.H{
			"id":      hp.ID,
			"name":    hp.Name,
			"address": hp.Address,
		},
		"voting": gin.H{
			"id":          voting.ID,
			"title":       voting.Title,
			"description": voting.Description,
		},
	}

	if group != nil {
		responseData["voting_group"] = gin.H{
			"id":          group.ID,
			"name":        group.Name,
			"description": group.Description,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Contexto obtenido exitosamente",
		"data":    responseData,
	})
}
