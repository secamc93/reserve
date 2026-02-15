package handlerpublic

import (
	"fmt"
	"net/http"
	"os"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"
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
func (h *PublicHandler) GetPublicVotingContext(c *gin.Context) {

	// Obtener y validar token de votación pública
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-public-voting-context.go - Token no proporcionado\n")
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
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-public-voting-context.go - Token inválido: %v\n", err)
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
	votingID := publicClaims.VotingID // Puede ser nil para tokens de grupo
	groupID := publicClaims.VotingGroupID
	isGroupToken := votingID == nil

	fmt.Printf("\n🏢 [VOTACION PUBLICA - OBTENIENDO CONTEXTO]\n")
	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Voting Group ID: %d\n", groupID)
	if isGroupToken {
		fmt.Printf("   Tipo: Token de GRUPO (múltiples votaciones)\n\n")
	} else {
		fmt.Printf("   Voting ID: %d\n", *votingID)
		fmt.Printf("   Tipo: Token de votación individual\n\n")
	}

	// Obtener información de la propiedad horizontal
	hp, err := h.sharedUseCase.GetHorizontalPropertyBasicInfo(c.Request.Context(), hpID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-public-voting-context.go - Error obteniendo HP: hp_id=%d, error=%v\n", hpID, err)
		h.logger.Error().Err(err).Uint("hp_id", hpID).Msg("Error obteniendo propiedad horizontal")
		c.JSON(http.StatusNotFound, response.ErrorResponse{
			Success: false,
			Message: "Propiedad horizontal no encontrada",
			Error:   err.Error(),
		})
		return
	}

	// Obtener información de la votación (solo para tokens individuales)
	var voting *domain.VotingDTO
	if !isGroupToken {
		voting, err = h.votingsUseCase.GetVotingByID(c.Request.Context(), hpID, groupID, *votingID)
		if err != nil {
			fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-public-voting-context.go - Error obteniendo votación: voting_id=%d, error=%v\n", *votingID, err)
			h.logger.Error().Err(err).Uint("voting_id", *votingID).Msg("Error obteniendo votación")
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Votación no encontrada",
				Error:   err.Error(),
			})
			return
		}
	}

	// Obtener información del grupo de votación
	group, err := h.votingGroupsUseCase.GetVotingGroupByID(c.Request.Context(), groupID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-public-voting-context.go - Error obteniendo grupo: group_id=%d, error=%v\n", groupID, err)
		h.logger.Error().Err(err).Uint("group_id", groupID).Msg("Error obteniendo grupo de votación")
		// No es crítico, continuamos sin la info del grupo
	}

	fmt.Printf("✅ [VOTACION PUBLICA - CONTEXTO OBTENIDO]\n")
	fmt.Printf("   Propiedad: %s\n", hp.Name)
	if isGroupToken {
		if group != nil {
			fmt.Printf("   Grupo: %s (%s)\n", group.Name, group.Description)
		}
	} else {
		fmt.Printf("   Votación: %s\n", voting.Title)
		if group != nil {
			fmt.Printf("   Grupo: %s\n", group.Name)
		}
	}
	fmt.Printf("\n")

	logEvent := h.logger.Info().
		Uint("hp_id", hpID).
		Str("hp_name", hp.Name).
		Bool("is_group_token", isGroupToken)

	if !isGroupToken {
		logEvent.Uint("voting_id", *votingID).Str("voting_title", voting.Title)
	}
	if group != nil {
		logEvent.Str("group_name", group.Name)
	}

	logEvent.Msg("✅ [VOTACION PUBLICA] Contexto obtenido exitosamente")

	responseData := gin.H{
		"property": gin.H{
			"id":      hp.ID,
			"name":    hp.Name,
			"address": hp.Address,
		},
		"is_group_token": isGroupToken,
	}

	// Solo agregar info de votación si es token individual
	if !isGroupToken {
		responseData["voting"] = gin.H{
			"id":          voting.ID,
			"title":       voting.Title,
			"description": voting.Description,
		}
	}

	// Agregar info de grupo si está disponible
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
