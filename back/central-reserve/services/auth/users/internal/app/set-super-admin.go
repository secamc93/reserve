package app

import (
	"central_reserve/services/auth/users/internal/domain"
	"context"
)

// SetSuperAdmin da o quita a un usuario el rol de super admin: el rol de alcance platform asignado
// sin propiedad. Nadie puede quitarse el rol a sí mismo (dejaría la plataforma sin acceso).
func (uc *UserUseCase) SetSuperAdmin(ctx context.Context, actorID uint, userID uint, enabled bool) error {
	if !enabled && actorID == userID {
		return domain.ErrCannotRevokeOwnSuperAdmin
	}

	user, err := uc.repository.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}
	if user == nil {
		return domain.ErrUserNotFound
	}

	roleID, err := uc.repository.GetPlatformRoleID(ctx)
	if err != nil {
		return err
	}
	if roleID == 0 {
		return domain.ErrPlatformRoleNotFound
	}

	if err := uc.repository.SetPlatformRole(ctx, userID, roleID, enabled); err != nil {
		uc.log.Error().Err(err).Uint("user_id", userID).Bool("enabled", enabled).Msg("Error al cambiar el rol de super admin")
		return err
	}

	uc.log.Info().Uint("actor_id", actorID).Uint("user_id", userID).Bool("enabled", enabled).Msg("Rol de super admin actualizado")
	return nil
}
