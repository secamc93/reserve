//go:build integration

package repository_test

import (
	"testing"

	"central_reserve/services/auth/users/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
	"dbpostgres/app/infra/models"
)

// Da, repite, quita y vuelve a dar el rol de plataforma: siempre queda a lo sumo una fila activa
// de business_staff sin propiedad, y GetUserRoles (lo que usa el login) la ve o no la ve.
func TestSetPlatformRole_DaQuitaYRestaura(t *testing.T) {
	database := testkit.DB(t)
	ctx := testkit.Ctx(t)
	repo := repository.New(database, testkit.Logger(t))
	conn := database.Conn(ctx)

	user := models.User{Name: "IT super admin", Email: "it-sa-" + testkit.Suffix() + "@rupu.test", Password: "x"}
	if err := conn.Create(&user).Error; err != nil {
		t.Fatalf("crear usuario: %v", err)
	}
	t.Cleanup(func() {
		conn.Unscoped().Where("user_id = ?", user.ID).Delete(&models.BusinessStaff{})
		conn.Unscoped().Delete(&user)
	})

	roleID, err := repo.GetPlatformRoleID(ctx)
	if err != nil || roleID == 0 {
		t.Fatalf("rol de plataforma: id=%d err=%v (la BD local debe tener el rol Super Admin)", roleID, err)
	}

	isPlatform := func() bool {
		roles, err := repo.GetUserRoles(ctx, user.ID)
		if err != nil {
			t.Fatalf("GetUserRoles: %v", err)
		}
		for _, r := range roles {
			if r.ScopeCode == "platform" {
				return true
			}
		}
		return false
	}
	activeRows := func() int64 {
		var n int64
		conn.Model(&models.BusinessStaff{}).Where("user_id = ? AND business_id IS NULL", user.ID).Count(&n)
		return n
	}

	for i, step := range []struct {
		enabled bool
		want    bool
	}{{true, true}, {true, true}, {false, false}, {true, true}} {
		if err := repo.SetPlatformRole(ctx, user.ID, roleID, step.enabled); err != nil {
			t.Fatalf("paso %d SetPlatformRole(%v): %v", i, step.enabled, err)
		}
		if got := isPlatform(); got != step.want {
			t.Fatalf("paso %d: es super admin = %v, quería %v", i, got, step.want)
		}
		wantRows := int64(0)
		if step.want {
			wantRows = 1
		}
		if n := activeRows(); n != wantRows {
			t.Fatalf("paso %d: filas activas sin propiedad = %d, quería %d", i, n, wantRows)
		}
	}
}
