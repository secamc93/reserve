package usecasepublic

import (
	"context"
	"crypto/subtle"
	"fmt"
	"strings"

	"central_reserve/services/horizontalproperty/vote/internal/app/usecasecredentials"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

// ValidateResidentForVoting valida a quien vota por QR en la unidad propertyUnitID.
//
// La regla la define el grupo del token (groupID):
//   - require_document_validation = true: el documento es obligatorio (ErrDocumentRequired) y
//     debe ser el de un residente activo de la unidad.
//   - require_document_validation = false: el documento se ignora; basta que la unidad exista,
//     sea de la propiedad del grupo y esté activa. El voto es por unidad: si la unidad no tiene
//     residentes se permite igual (ResidentID = 0, nombre "Unidad <número>").
//
// Además, si el grupo tiene contraseñas generadas (las que se entregan impresas en la asistencia),
// la contraseña de la unidad es obligatoria (ErrPasswordRequired) y debe coincidir
// (ErrInvalidPassword). Una unidad sin contraseña en ese grupo no puede votar.
func (uc *PublicUseCase) ValidateResidentForVoting(ctx context.Context, hpID, groupID, propertyUnitID uint, dni, password string) (*domain.ValidatedVoterDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ValidateResidentForVoting")

	if propertyUnitID == 0 {
		return nil, domain.ErrPropertyUnitRequired
	}

	group, err := uc.repo.GetVotingGroupByID(ctx, groupID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("group_id", groupID).Msg("Error obteniendo grupo de votación para validar residente")
		return nil, err
	}
	if group == nil || group.BusinessID != hpID {
		return nil, domain.ErrVotingGroupNotFound
	}

	requirePassword, err := uc.checkVotingPassword(ctx, groupID, propertyUnitID, password)
	if err != nil {
		return nil, err
	}

	if group.RequireDocumentValidation {
		dni = strings.TrimSpace(dni)
		if dni == "" {
			return nil, domain.ErrDocumentRequired
		}
		resident, err := uc.repo.GetResidentByUnitAndDni(ctx, hpID, propertyUnitID, dni)
		if err != nil {
			uc.logger.Error(ctx).Err(err).Uint("hp_id", hpID).Uint("property_unit_id", propertyUnitID).Msg("Error buscando residente para votación")
			return nil, err
		}
		if resident == nil {
			return nil, domain.ErrResidentNotFound
		}
		uc.logger.Info(ctx).Uint("resident_id", resident.ID).Uint("property_unit_id", propertyUnitID).Msg("Residente validado por documento para votación pública")
		return &domain.ValidatedVoterDTO{
			ResidentID:                resident.ID,
			ResidentName:              resident.Name,
			PropertyUnitID:            resident.PropertyUnitID,
			PropertyUnitNumber:        resident.PropertyUnitNumber,
			RequireDocumentValidation: true,
			RequirePassword:           requirePassword,
		}, nil
	}

	unit, err := uc.repo.GetPublicVoterUnit(ctx, hpID, propertyUnitID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("hp_id", hpID).Uint("property_unit_id", propertyUnitID).Msg("Error obteniendo unidad para votación pública")
		return nil, err
	}
	if unit == nil {
		return nil, domain.ErrPropertyUnitNotFound
	}
	if !unit.IsActive {
		return nil, domain.ErrPropertyUnitInactive
	}

	name := unit.ResidentName
	if unit.ResidentID == 0 || strings.TrimSpace(name) == "" {
		name = fmt.Sprintf("Unidad %s", unit.PropertyUnitNumber)
	}
	uc.logger.Info(ctx).Uint("property_unit_id", unit.PropertyUnitID).Uint("resident_id", unit.ResidentID).Msg("Unidad validada sin documento para votación pública")
	return &domain.ValidatedVoterDTO{
		ResidentID:                unit.ResidentID,
		ResidentName:              name,
		PropertyUnitID:            unit.PropertyUnitID,
		PropertyUnitNumber:        unit.PropertyUnitNumber,
		RequireDocumentValidation: false,
		RequirePassword:           requirePassword,
	}, nil
}

// checkVotingPassword valida la contraseña de la unidad si el grupo tiene contraseñas generadas.
// Devuelve si el grupo las exige.
func (uc *PublicUseCase) checkVotingPassword(ctx context.Context, groupID, propertyUnitID uint, password string) (bool, error) {
	total, err := uc.repo.CountVotingCredentials(ctx, groupID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("group_id", groupID).Msg("Error contando contraseñas del grupo")
		return false, err
	}
	if total == 0 {
		return false, nil
	}
	password = usecasecredentials.NormalizePassword(password)
	if password == "" {
		return true, domain.ErrPasswordRequired
	}
	stored, err := uc.repo.GetVotingCredentialPassword(ctx, groupID, propertyUnitID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("group_id", groupID).Uint("property_unit_id", propertyUnitID).Msg("Error obteniendo contraseña de la unidad")
		return true, err
	}
	if stored == "" || subtle.ConstantTimeCompare([]byte(stored), []byte(password)) != 1 {
		uc.logger.Warn(ctx).Uint("group_id", groupID).Uint("property_unit_id", propertyUnitID).Msg("Contraseña de votación incorrecta")
		return true, domain.ErrInvalidPassword
	}
	return true, nil
}

// GroupRequiresPassword indica si el voto público del grupo exige contraseña (tiene contraseñas
// generadas).
func (uc *PublicUseCase) GroupRequiresPassword(ctx context.Context, groupID uint) (bool, error) {
	total, err := uc.repo.CountVotingCredentials(ctx, groupID)
	if err != nil {
		return false, err
	}
	return total > 0, nil
}
