package usecasevote

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// ValidateResidentForVoting valida que un residente pertenezca a una unidad específica por DNI
func (uc *votingUseCase) ValidateResidentForVoting(ctx context.Context, hpID, propertyUnitID uint, dni string) (*domain.ResidentBasicDTO, error) {
	// Validar que el DNI no esté vacío
	if dni == "" {
		return nil, fmt.Errorf("el DNI es requerido")
	}

	// Validar que property_unit_id sea válido
	if propertyUnitID == 0 {
		return nil, fmt.Errorf("el ID de unidad es requerido")
	}

	// Buscar residente por unidad y DNI
	resident, err := uc.residentRepo.GetResidentByUnitAndDni(ctx, hpID, propertyUnitID, dni)
	if err != nil {
		uc.logger.Error().Err(err).Uint("hp_id", hpID).Uint("property_unit_id", propertyUnitID).Str("dni", dni).Msg("Error buscando residente para votación")
		return nil, err
	}

	uc.logger.Info().Uint("resident_id", resident.ID).Uint("property_unit_id", propertyUnitID).Msg("Residente validado para votación pública")
	return resident, nil
}
