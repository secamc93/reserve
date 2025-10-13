package handlervote

import (
	"fmt"
	"net/http"
	"os"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// ValidateResidentRequest - Request para validar residente
type ValidateResidentRequest struct {
	PropertyUnitID uint   `json:"property_unit_id" binding:"required" example:"1"`
	Dni            string `json:"dni" binding:"required" example:"123456789"`
}

// ValidateResidentForVoting godoc
//
//	@Summary		Validar residente para votación pública
//	@Description	Valida que un residente pertenezca a una unidad usando su DNI y retorna token temporal para votar. TODA la información viene del token.
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		json
//	@Param			request			body	ValidateResidentRequest	true	"Datos de validación"
//	@Param			Authorization	header	string					true	"Token de votación pública (Bearer token)"
//	@Success		200				{object}	object
//	@Failure		400				{object}	object
//	@Failure		401				{object}	object
//	@Failure		404				{object}	object
//	@Failure		500				{object}	object
//	@Router			/public/validate-resident [post]
func (h *VotingHandler) ValidateResidentForVoting(c *gin.Context) {

	// Obtener y validar token de votación pública
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/validate-resident-for-voting.go - Token no proporcionado\n")
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
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/validate-resident-for-voting.go - Token inválido: %v\n", err)
		h.logger.Error().Err(err).Msg("Token de votación pública inválido")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de votación inválido",
			Error:   err.Error(),
		})
		return
	}

	// Extraer toda la información del token
	hpID := publicClaims.HPID
	votingID := publicClaims.VotingID
	groupID := publicClaims.VotingGroupID

	fmt.Printf("\n🔐 [VOTACION PUBLICA - VALIDACION TOKEN]\n")
	fmt.Printf("   Token decodificado exitosamente\n")
	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Grupo de Votación ID: %d\n", groupID)
	fmt.Printf("   Votación ID: %d\n", votingID)
	fmt.Printf("   Scope: %s\n\n", publicClaims.Scope)

	// Validar request
	var req ValidateResidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/validate-resident-for-voting.go - Error validando request: %v\n", err)
		h.logger.Error().Err(err).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	fmt.Printf("👤 [VOTACION PUBLICA - VALIDANDO RESIDENTE]\n")
	fmt.Printf("   Unidad ID: %d\n", req.PropertyUnitID)
	fmt.Printf("   DNI: %s\n\n", req.Dni)

	// Validar residente a través del use case
	resident, err := h.votingUseCase.ValidateResidentForVoting(c.Request.Context(), hpID, req.PropertyUnitID, req.Dni)
	if err != nil {
		status := http.StatusInternalServerError
		message := "Error validando residente"

		// Manejar errores específicos
		errorMsg := err.Error()
		if errorMsg == "residente no encontrado" || errorMsg == "residente no pertenece a esta unidad" {
			status = http.StatusNotFound
			message = "Residente no encontrado"
		} else if errorMsg == "residente inactivo" {
			status = http.StatusForbidden
			message = "Residente inactivo"
		}

		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/validate-resident-for-voting.go - Error validando residente: property_unit=%d, dni=%s, error=%v\n",
			req.PropertyUnitID, req.Dni, err)
		h.logger.Error().Err(err).Uint("property_unit_id", req.PropertyUnitID).Str("dni", req.Dni).Msg("Error validando residente")
		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: message,
			Error:   err.Error(),
		})
		return
	}

	fmt.Printf("✅ [VOTACION PUBLICA - RESIDENTE ENCONTRADO]\n")
	fmt.Printf("   Residente ID: %d\n", resident.ID)
	fmt.Printf("   Nombre: %s\n", resident.Name)
	fmt.Printf("   Unidad: %s\n\n", resident.PropertyUnitNumber)

	// Generar token temporal de autenticación de votación
	votingAuthToken, err := jwtService.GenerateVotingAuthToken(resident.ID, votingID, groupID, hpID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/validate-resident-for-voting.go - Error generando token de auth: %v\n", err)
		h.logger.Error().Err(err).Uint("resident_id", resident.ID).Msg("Error generando token de autenticación de votación")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error generando token de autenticación",
			Error:   err.Error(),
		})
		return
	}

	tokenAuthPreview := votingAuthToken
	if len(votingAuthToken) > 20 {
		tokenAuthPreview = votingAuthToken[:20] + "..."
	}

	fmt.Printf("🎫 [VOTACION PUBLICA - TOKEN DE AUTENTICACION GENERADO]\n")
	fmt.Printf("   Residente ID: %d\n", resident.ID)
	fmt.Printf("   Votación ID: %d\n", votingID)
	fmt.Printf("   Grupo ID: %d\n", groupID)
	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Token (preview): %s\n", tokenAuthPreview)
	fmt.Printf("   Scope: voting_auth\n")
	fmt.Printf("   Validez: 2 horas\n\n")

	h.logger.Info().
		Uint("resident_id", resident.ID).
		Uint("voting_id", votingID).
		Uint("voting_group_id", groupID).
		Uint("hp_id", hpID).
		Str("resident_name", resident.Name).
		Str("property_unit", resident.PropertyUnitNumber).
		Msg("✅ [VOTACION PUBLICA] Residente validado exitosamente")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Residente validado exitosamente",
		"data": gin.H{
			"resident_id":          resident.ID,
			"resident_name":        resident.Name,
			"property_unit_id":     resident.PropertyUnitID,
			"property_unit_number": resident.PropertyUnitNumber,
			"voting_auth_token":    votingAuthToken,
			"voting_id":            votingID,
			"voting_group_id":      groupID,
			"hp_id":                hpID,
		},
	})
}
