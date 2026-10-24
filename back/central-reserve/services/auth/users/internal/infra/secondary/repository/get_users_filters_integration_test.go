//go:build integration

package repository_test

import (
	"testing"

	"central_reserve/services/auth/users/internal/domain"
	"central_reserve/services/auth/users/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
	"dbpostgres/app/infra/models"
)

// Los roles y propiedades de un usuario viven en business_staff (no en las tablas viejas
// user_roles / user_businesses): GetUsers debe filtrar por ahí.
func TestGetUsers_FiltraPorRolYPropiedadDeBusinessStaff(t *testing.T) {
	database := testkit.DB(t)
	ctx := testkit.Ctx(t)
	repo := repository.New(database, testkit.Logger(t))
	conn := database.Conn(ctx)

	var business models.Business
	if err := conn.First(&business).Error; err != nil {
		t.Fatalf("la BD local debe tener al menos una propiedad: %v", err)
	}
	role := models.Role{Name: "IT rol " + testkit.Suffix(), Description: "prueba", Level: 5, ScopeID: 2}
	if err := conn.Create(&role).Error; err != nil {
		t.Fatalf("crear rol: %v", err)
	}
	user := models.User{Name: "IT filtros", Email: "it-filtros-" + testkit.Suffix() + "@rupu.test", Password: "x"}
	if err := conn.Create(&user).Error; err != nil {
		t.Fatalf("crear usuario: %v", err)
	}
	other := models.User{Name: "IT sin rol", Email: "it-sinrol-" + testkit.Suffix() + "@rupu.test", Password: "x"}
	if err := conn.Create(&other).Error; err != nil {
		t.Fatalf("crear usuario: %v", err)
	}
	staff := models.BusinessStaff{UserID: user.ID, BusinessID: &business.ID, RoleID: &role.ID}
	if err := conn.Create(&staff).Error; err != nil {
		t.Fatalf("crear business_staff: %v", err)
	}
	t.Cleanup(func() {
		conn.Unscoped().Where("user_id IN ?", []uint{user.ID, other.ID}).Delete(&models.BusinessStaff{})
		conn.Unscoped().Delete(&user)
		conn.Unscoped().Delete(&other)
		conn.Unscoped().Delete(&role)
	})

	ids := func(f domain.UserFilters) map[uint]bool {
		f.Page, f.PageSize = 1, 200
		f.UserIDs = []uint{user.ID, other.ID}
		users, _, err := repo.GetUsers(ctx, f)
		if err != nil {
			t.Fatalf("GetUsers: %v", err)
		}
		out := map[uint]bool{}
		for _, u := range users {
			out[u.ID] = true
		}
		return out
	}

	byRole := ids(domain.UserFilters{RoleID: &role.ID})
	if !byRole[user.ID] || byRole[other.ID] {
		t.Fatalf("filtro por rol: quería solo %d, obtuve %v", user.ID, byRole)
	}
	byBusiness := ids(domain.UserFilters{BusinessID: &business.ID})
	if !byBusiness[user.ID] || byBusiness[other.ID] {
		t.Fatalf("filtro por propiedad: quería solo %d, obtuve %v", user.ID, byBusiness)
	}

	// Al quitarle el acceso (soft delete), deja de aparecer.
	if err := conn.Delete(&staff).Error; err != nil {
		t.Fatalf("borrar business_staff: %v", err)
	}
	if ids(domain.UserFilters{RoleID: &role.ID})[user.ID] {
		t.Fatal("un acceso borrado no debe contar para el filtro por rol")
	}
}
