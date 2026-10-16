package usecasecredentials

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

// GenerateCredentials ver ICredentialsUseCase.
func (uc *CredentialsUseCase) GenerateCredentials(ctx context.Context, groupID uint, regenerate bool) (*domain.GenerateCredentialsResultDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "GenerateCredentials")

	group, err := uc.repo.GetVotingGroupByID(ctx, groupID)
	if err != nil {
		return nil, err
	}
	if group == nil {
		return nil, domain.ErrVotingGroupNotFound
	}
	businessID := group.BusinessID

	unitIDs, err := uc.repo.ListActiveUnitIDsByBusiness(ctx, businessID)
	if err != nil {
		return nil, err
	}
	if len(unitIDs) == 0 {
		return nil, domain.ErrNoUnitsForCredentials
	}

	// Contraseñas ya usadas en el grupo (para no repetir) y unidades que ya tienen una.
	withPassword := map[uint]bool{}
	if !regenerate {
		existing, err := uc.repo.ListVotingCredentialUnitIDs(ctx, groupID)
		if err != nil {
			return nil, err
		}
		for _, id := range existing {
			withPassword[id] = true
		}
	}
	used := map[string]bool{}
	if !regenerate && len(withPassword) > 0 {
		page, _, err := uc.repo.ListVotingCredentials(ctx, groupID, 1, len(withPassword))
		if err != nil {
			return nil, err
		}
		for _, c := range page {
			used[c.Password] = true
		}
	}

	var creds []domain.VotingCredential
	for _, unitID := range unitIDs {
		if withPassword[unitID] {
			continue
		}
		password, err := uc.uniquePassword(used)
		if err != nil {
			return nil, err
		}
		creds = append(creds, domain.VotingCredential{
			BusinessID:     businessID,
			VotingGroupID:  groupID,
			PropertyUnitID: unitID,
			Password:       password,
		})
	}

	if err := uc.repo.SaveVotingCredentials(ctx, groupID, creds, regenerate); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("group_id", groupID).Msg("Error guardando contraseñas de voto")
		return nil, err
	}
	total, err := uc.repo.CountVotingCredentials(ctx, groupID)
	if err != nil {
		return nil, err
	}
	uc.logger.Info(ctx).Uint("group_id", groupID).Int("generated", len(creds)).Bool("regenerate", regenerate).Msg("Contraseñas de voto generadas")
	return &domain.GenerateCredentialsResultDTO{Generated: len(creds), Total: total}, nil
}

// uniquePassword genera una contraseña que no esté en used y la agrega.
func (uc *CredentialsUseCase) uniquePassword(used map[string]bool) (string, error) {
	for attempt := 0; attempt < 50; attempt++ {
		p, err := uc.newPassword()
		if err != nil {
			return "", fmt.Errorf("error generando contraseña: %w", err)
		}
		if !used[p] {
			used[p] = true
			return p, nil
		}
	}
	return "", fmt.Errorf("no se pudo generar una contraseña única")
}
