package handlervote

import (
	"fmt"
	"net/http"
	"os"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// GetPublicUnitsWithResidents godoc
//
//	@Summary		Listar unidades con residentes (público)
//	@Description	Lista todas las unidades activas con su residente principal. Para cruzar con votos en el frontend.
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		json
//	@Param			Authorization	header	string	true	"Token de autenticación de votación (Bearer token)"
//	@Success		200				{object}	object
//	@Failure		401				{object}	object
//	@Failure		500				{object}	object
//	@Router			/public/units-with-residents [get]
func (h *VotingHandler) GetPublicUnitsWithResidents(c *gin.Context) {

	// Obtener y validar token de autenticación de votación
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-units-with-residents.go - Token no proporcionado\n")
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
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-units-with-residents.go - Token inválido: %v\n", err)
		h.logger.Error().Err(err).Msg("Token de autenticación de votación inválido")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de autenticación inválido",
			Error:   err.Error(),
		})
		return
	}

	// Extraer HP ID del token
	hpID := authClaims.HPID
	votingID := authClaims.VotingID

	fmt.Printf("\n🏢 [VOTACION PUBLICA - LISTANDO UNIDADES CON RESIDENTES]\n")
	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Votación ID: %d\n\n", votingID)

	// Obtener unidades con residentes mediante query directa
	units, err := h.votingUseCase.GetUnitsWithResidents(c.Request.Context(), hpID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/get-public-units-with-residents.go - Error listando unidades: hp_id=%d, error=%v\n", hpID, err)
		h.logger.Error().Err(err).Uint("hp_id", hpID).Msg("Error listando unidades con residentes")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo unidades con residentes",
			Error:   err.Error(),
		})
		return
	}

	// Mapear a response con snake_case
	unitsResponse := mapper.MapUnitsWithResidentsToResponses(units)

	fmt.Printf("✅ [VOTACION PUBLICA - UNIDADES CON RESIDENTES LISTADAS]\n")
	fmt.Printf("   Total: %d unidades\n\n", len(units))

	h.logger.Info().
		Uint("hp_id", hpID).
		Int("units_count", len(units)).
		Msg("✅ [VOTACION PUBLICA] Unidades con residentes listadas")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Unidades con residentes obtenidas exitosamente",
		"data":    unitsResponse,
	})
}
