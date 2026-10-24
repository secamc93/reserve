//go:build integration

package repository_test

import (
	"testing"

	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/domain"
	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
	"dbpostgres/app/infra/models"
)

// Borrar un conjunto libera su código y su dominio: se puede crear otro con los mismos. También se
// liberan los de conjuntos que se borraron antes de este arreglo (al crear).
func TestBorrarYCrearConElMismoCodigoYDominio(t *testing.T) {
	database := testkit.DB(t)
	ctx := testkit.Ctx(t)
	repo := repository.New(database, testkit.Logger(t))
	conn := database.Conn(ctx)

	hpType, err := repo.GetHorizontalPropertyType(ctx)
	if err != nil || hpType == nil {
		t.Fatalf("tipo horizontal_property: %v", err)
	}
	suffix := testkit.Suffix()
	code, domainName := "it-pinos-"+suffix, "it-pinos-"+suffix
	newProp := func() *domain.HorizontalProperty {
		return &domain.HorizontalProperty{Name: "IT Pinos " + suffix, Code: code, CustomDomain: domainName, BusinessTypeID: hpType.ID, Timezone: "America/Bogota", Address: "Calle 1", IsActive: true}
	}
	var ids []uint
	t.Cleanup(func() {
		for _, id := range ids {
			conn.Unscoped().Delete(&models.Business{}, id)
		}
	})

	// 1) Crear, borrar con el repositorio y volver a crear con el mismo código y dominio.
	first, err := repo.CreateHorizontalProperty(ctx, newProp())
	if err != nil {
		t.Fatalf("crear: %v", err)
	}
	ids = append(ids, first.ID)
	if err := repo.DeleteHorizontalProperty(ctx, first.ID); err != nil {
		t.Fatalf("borrar: %v", err)
	}
	second, err := repo.CreateHorizontalProperty(ctx, newProp())
	if err != nil {
		t.Fatalf("volver a crear con el mismo código y dominio: %v", err)
	}
	ids = append(ids, second.ID)

	// 2) Borrado "a la antigua" (solo deleted_at, sin liberar): crear de nuevo igual funciona.
	if err := conn.Delete(&models.Business{}, second.ID).Error; err != nil {
		t.Fatalf("borrado directo: %v", err)
	}
	third, err := repo.CreateHorizontalProperty(ctx, newProp())
	if err != nil {
		t.Fatalf("crear sobre un borrado antiguo: %v", err)
	}
	ids = append(ids, third.ID)

	var old models.Business
	if err := conn.Unscoped().First(&old, second.ID).Error; err != nil {
		t.Fatalf("leer borrado: %v", err)
	}
	if old.Code == code || old.CustomDomain == domainName || len(old.Code) > 50 {
		t.Fatalf("el borrado debía quedar con código/dominio liberados: %q / %q", old.Code, old.CustomDomain)
	}
}
