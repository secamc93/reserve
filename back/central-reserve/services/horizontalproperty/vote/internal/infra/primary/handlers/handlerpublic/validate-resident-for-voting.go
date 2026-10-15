package handlerpublic

import (
	"errors"
	"net/http"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"
	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// ValidateResidentRequest - Request para validar a quien vota por QR
type ValidateResidentRequest struct {
	PropertyUnitID uint `json:"property_unit_id" binding:"required" example:"1"`
	// Dni es obligatorio solo si el grupo tiene require_document_validation = true; si no, se ignora.
	Dni string `json:"dni" example:"123456789"`
}

// ValidateResidentForVoting godoc
//
//	@Summary		Validar residente/unidad para votación pública
//	@Description	Valida a quien vota por QR y devuelve el token de votación (voting_auth_token). Si el grupo del token tiene require_document_validation=true, `dni` es obligatorio (400 "Documento requerido") y debe ser de un residente activo de la unidad (404 si no). Si es false, `dni` se ignora: basta que la unidad exista, sea de la propiedad (404) y esté activa (400); si no tiene residentes igual puede votar (resident_id 0, resident_name "Unidad <número>").
//	@Tags			Votaciones Públicas
//	@Accept			json
//	@Produce		json
//	@Param			request			body	ValidateResidentRequest	true	"Datos de validación"
//	@Param			Authorization	header	string					true	"Token público del QR (Bearer token)"
//	@Success		200				{object}	object
//	@Failure		400				{object}	response.ErrorResponse
//	@Failure		401				{object}	response.ErrorResponse
//	@Failure		403				{object}	response.ErrorResponse
//	@Failure		404				{object}	response.ErrorResponse
//	@Failure		500				{object}	response.ErrorResponse
//	@Router			/public/validate-resident [post]
func (h *PublicHandler) ValidateResidentForVoting(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de votación requerido",
			Error:   "Debe proporcionar el token de votación pública",
		})
		return
	}
	tokenString := authHeader
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		tokenString = authHeader[7:]
	}

	jwtService := sharedjwt.New(h.jwtSecret)
	publicClaims, err := jwtService.ValidatePublicVotingToken(tokenString)
	if err != nil {
		h.logger.Warn().Err(err).Msg("Token de votación pública inválido")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de votación inválido",
			Error:   err.Error(),
		})
		return
	}

	hpID := publicClaims.HPID
	votingID := publicClaims.VotingID // nil para tokens de grupo
	groupID := publicClaims.VotingGroupID
	isGroupToken := votingID == nil

	var req ValidateResidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	voter, err := h.publicUseCase.ValidateResidentForVoting(c.Request.Context(), hpID, groupID, req.PropertyUnitID, req.Dni)
	if err != nil {
		status, message := validateResidentErrorStatus(err)
		if status >= http.StatusInternalServerError {
			h.logger.Error().Err(err).Uint("property_unit_id", req.PropertyUnitID).Msg("Error validando residente")
		}
		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: message,
			Error:   err.Error(),
		})
		return
	}

	var votingAuthToken string
	if isGroupToken {
		votingAuthToken, err = jwtService.GenerateGroupVotingAuthToken(voter.ResidentID, voter.PropertyUnitID, groupID, hpID)
	} else {
		votingAuthToken, err = jwtService.GenerateVotingAuthToken(voter.ResidentID, voter.PropertyUnitID, *votingID, groupID, hpID)
	}
	if err != nil {
		h.logger.Error().Err(err).Uint("property_unit_id", voter.PropertyUnitID).Msg("Error generando token de autenticación de votación")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error generando token de autenticación",
			Error:   err.Error(),
		})
		return
	}

	h.logger.Info().
		Uint("resident_id", voter.ResidentID).
		Uint("property_unit_id", voter.PropertyUnitID).
		Uint("voting_group_id", groupID).
		Bool("require_document_validation", voter.RequireDocumentValidation).
		Bool("is_group_token", isGroupToken).
		Msg("[VOTACION PUBLICA] Votante validado")

	responseData := gin.H{
		"resident_id":                 voter.ResidentID,
		"resident_name":               voter.ResidentName,
		"property_unit_id":            voter.PropertyUnitID,
		"property_unit_number":        voter.PropertyUnitNumber,
		"voting_auth_token":           votingAuthToken,
		"voting_group_id":             groupID,
		"hp_id":                       hpID,
		"is_group_token":              isGroupToken,
		"require_document_validation": voter.RequireDocumentValidation,
	}
	if !isGroupToken {
		responseData["voting_id"] = *votingID
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Residente validado exitosamente",
		"data":    responseData,
	})
}

// validateResidentErrorStatus traduce los errores del caso de uso a status HTTP y mensaje.
func validateResidentErrorStatus(err error) (int, string) {
	switch {
	case errors.Is(err, domain.ErrDocumentRequired):
		return http.StatusBadRequest, "Documento requerido"
	case errors.Is(err, domain.ErrPropertyUnitRequired):
		return http.StatusBadRequest, "Unidad requerida"
	case errors.Is(err, domain.ErrPropertyUnitInactive):
		return http.StatusBadRequest, "Unidad inactiva"
	case errors.Is(err, domain.ErrPropertyUnitNotFound):
		return http.StatusNotFound, "Unidad no encontrada"
	case errors.Is(err, domain.ErrResidentNotFound), err.Error() == domain.ErrResidentNotFound.Error():
		return http.StatusNotFound, "Residente no encontrado"
	case errors.Is(err, domain.ErrVotingGroupNotFound), err.Error() == domain.ErrVotingGroupNotFound.Error():
		return http.StatusNotFound, "Grupo de votación no encontrado"
	default:
		return http.StatusInternalServerError, "Error validando residente"
	}
}
