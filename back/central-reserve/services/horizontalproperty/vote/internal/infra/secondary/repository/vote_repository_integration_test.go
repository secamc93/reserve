//go:build integration

package repository_test

import (
	"context"
	"sort"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/repository"
	"central_reserve/shared/db"
	"central_reserve/shared/testkit"
)

// escenario: propiedad horizontal real con un grupo, una votación y opciones Sí/No/Abstención.
type escenario struct {
	hp         *testkit.HorizontalProperty
	groupID    uint
	votingID   uint
	si, no, ab uint // ids de opciones
}

func nuevoRepo(t *testing.T) (*repository.Repository, db.IDatabase) {
	t.Helper()
	database := testkit.DB(t)
	return repository.New(database, testkit.Logger(t)), database
}

func crearGrupo(t *testing.T, ctx context.Context, repo *repository.Repository, businessID uint, nombre string) uint {
	t.Helper()
	quorum := 50.0
	g, err := repo.CreateVotingGroup(ctx, &domain.VotingGroup{
		BusinessID:       businessID,
		Name:             nombre,
		Description:      "grupo de prueba de integración",
		VotingStartDate:  time.Now(),
		VotingEndDate:    time.Now().Add(2 * time.Hour),
		RequiresQuorum:   true,
		QuorumPercentage: &quorum,
	})
	if err != nil {
		t.Fatalf("CreateVotingGroup: %v", err)
	}
	if g.ID == 0 || g.BusinessID != businessID || !g.IsActive {
		t.Fatalf("grupo creado inesperado: %+v", g)
	}
	return g.ID
}

func crearVotacion(t *testing.T, ctx context.Context, repo *repository.Repository, groupID uint, titulo string, orden int) uint {
	t.Helper()
	req := 50.0
	v, err := repo.CreateVoting(ctx, &domain.Voting{
		VotingGroupID:      groupID,
		Title:              titulo,
		Description:        "votación de prueba de integración",
		VotingType:         "simple",
		AllowAbstention:    true,
		DisplayOrder:       orden,
		RequiredPercentage: &req,
	})
	if err != nil {
		t.Fatalf("CreateVoting: %v", err)
	}
	return v.ID
}

func crearOpcionesSiNoAbstencion(t *testing.T, ctx context.Context, repo *repository.Repository, votingID uint) (si, no, ab uint) {
	t.Helper()
	ids := make([]uint, 0, 3)
	for i, o := range []struct{ text, code, color string }{
		{"Sí", "yes", "#22c55e"},
		{"No", "no", "#ef4444"},
		{"Abstención", "abstention", "#94a3b8"},
	} {
		opt, err := repo.CreateVotingOption(ctx, &domain.VotingOption{
			VotingID: votingID, OptionText: o.text, OptionCode: o.code, Color: o.color, DisplayOrder: i + 1,
		})
		if err != nil {
			t.Fatalf("CreateVotingOption %q: %v", o.text, err)
		}
		ids = append(ids, opt.ID)
	}
	return ids[0], ids[1], ids[2]
}

func nuevoEscenario(t *testing.T, ctx context.Context, database db.IDatabase, repo *repository.Repository, units []testkit.UnitSpec) *escenario {
	t.Helper()
	hp := testkit.NewHorizontalProperty(t, database, units)
	e := &escenario{hp: hp}
	e.groupID = crearGrupo(t, ctx, repo, hp.BusinessID, "Asamblea IT "+hp.Code)
	e.votingID = crearVotacion(t, ctx, repo, e.groupID, "Aprobación presupuesto", 1)
	e.si, e.no, e.ab = crearOpcionesSiNoAbstencion(t, ctx, repo, e.votingID)
	return e
}

func votar(t *testing.T, ctx context.Context, repo *repository.Repository, votingID, unitID, optionID uint) *domain.Vote {
	t.Helper()
	v, err := repo.CreateVote(ctx, domain.Vote{VotingID: votingID, PropertyUnitID: unitID, VotingOptionID: optionID})
	if err != nil {
		t.Fatalf("CreateVote(voting=%d, unidad=%d): %v", votingID, unitID, err)
	}
	return v
}

func unidades3() []testkit.UnitSpec {
	return []testkit.UnitSpec{
		{Number: "101", Coefficient: 50},
		{Number: "102", Coefficient: 30},
		{Number: "103", Coefficient: 20},
	}
}

func sortedIDs(ids []uint) []uint {
	out := append([]uint(nil), ids...)
	sort.Slice(out, func(i, j int) bool { return out[i] < out[j] })
	return out
}

func equalIDs(a, b []uint) bool {
	a, b = sortedIDs(a), sortedIDs(b)
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

// CU-01: grupo, votación y opciones quedan persistidos y se leen en orden.
func TestRepo_CrearGrupoVotacionYOpciones(t *testing.T) {
	ctx := testkit.Ctx(t)
	repo, database := nuevoRepo(t)
	e := nuevoEscenario(t, ctx, database, repo, unidades3())

	groups, err := repo.ListVotingGroupsByBusiness(ctx, e.hp.BusinessID)
	if err != nil {
		t.Fatalf("ListVotingGroupsByBusiness: %v", err)
	}
	if len(groups) != 1 || groups[0].ID != e.groupID {
		t.Fatalf("grupos del negocio = %+v, se esperaba solo el grupo %d", groups, e.groupID)
	}
	if groups[0].QuorumPercentage == nil || *groups[0].QuorumPercentage != 50 {
		t.Errorf("quórum persistido = %v, se esperaba 50", groups[0].QuorumPercentage)
	}

	voting, err := repo.GetVotingByID(ctx, e.votingID)
	if err != nil {
		t.Fatalf("GetVotingByID: %v", err)
	}
	if voting.VotingGroupID != e.groupID || voting.Title != "Aprobación presupuesto" || !voting.IsActive {
		t.Errorf("votación leída inesperada: %+v", voting)
	}
	if voting.RequiredPercentage == nil || *voting.RequiredPercentage != 50 {
		t.Errorf("porcentaje requerido = %v, se esperaba 50", voting.RequiredPercentage)
	}

	votings, err := repo.ListVotingsByGroup(ctx, e.groupID)
	if err != nil {
		t.Fatalf("ListVotingsByGroup: %v", err)
	}
	if len(votings) != 1 || votings[0].ID != e.votingID {
		t.Fatalf("votaciones del grupo = %+v", votings)
	}

	opts, err := repo.ListVotingOptionsByVoting(ctx, e.votingID)
	if err != nil {
		t.Fatalf("ListVotingOptionsByVoting: %v", err)
	}
	want := []struct {
		id   uint
		text string
	}{{e.si, "Sí"}, {e.no, "No"}, {e.ab, "Abstención"}}
	if len(opts) != len(want) {
		t.Fatalf("opciones = %d, se esperaban %d", len(opts), len(want))
	}
	for i, w := range want {
		if opts[i].ID != w.id || opts[i].OptionText != w.text || !opts[i].IsActive {
			t.Errorf("opción %d = %+v, se esperaba id=%d texto=%q activa", i, opts[i], w.id, w.text)
		}
	}

	// La BD impide dos opciones con el mismo texto en la misma votación.
	if _, err := repo.CreateVotingOption(ctx, &domain.VotingOption{VotingID: e.votingID, OptionText: "Sí", OptionCode: "yes2", Color: "#000000"}); err == nil {
		t.Errorf("se aceptó una opción duplicada \"Sí\" en la misma votación")
	}
}

// Una unidad vota una sola vez por votación: el repositorio (índice único de la BD) rechaza
// el segundo voto y no lo duplica; la misma unidad sí puede votar en otra votación.
func TestRepo_VotoDuplicadoDeLaMismaUnidadSeRechaza(t *testing.T) {
	ctx := testkit.Ctx(t)
	repo, database := nuevoRepo(t)
	e := nuevoEscenario(t, ctx, database, repo, unidades3())
	u1, u2 := e.hp.UnitID(0), e.hp.UnitID(1)

	first := votar(t, ctx, repo, e.votingID, u1, e.si)
	if first.ID == 0 || first.OptionText != "Sí" || first.OptionCode != "yes" {
		t.Errorf("voto creado sin datos de la opción: %+v", first)
	}

	if _, err := repo.CreateVote(ctx, domain.Vote{VotingID: e.votingID, PropertyUnitID: u1, VotingOptionID: e.no}); err == nil {
		t.Fatalf("se aceptó un segundo voto de la unidad %d en la votación %d", u1, e.votingID)
	}

	votes, err := repo.ListVotesByVoting(ctx, e.votingID)
	if err != nil {
		t.Fatalf("ListVotesByVoting: %v", err)
	}
	if len(votes) != 1 || votes[0].ID != first.ID || votes[0].VotingOptionID != e.si {
		t.Fatalf("votos tras el duplicado = %+v, se esperaba solo el voto original por Sí", votes)
	}

	voted, err := repo.HasUnitVoted(ctx, e.votingID, u1)
	if err != nil || !voted {
		t.Errorf("HasUnitVoted(u1) = %v, %v; se esperaba true", voted, err)
	}
	voted, err = repo.HasUnitVoted(ctx, e.votingID, u2)
	if err != nil || voted {
		t.Errorf("HasUnitVoted(u2) = %v, %v; se esperaba false", voted, err)
	}

	got, err := repo.GetUnitVote(ctx, e.votingID, u1)
	if err != nil || got.ID != first.ID || got.OptionCode != "yes" {
		t.Errorf("GetUnitVote(u1) = %+v, %v", got, err)
	}

	// La regla es por votación: la misma unidad vota en otra votación del grupo.
	otra := crearVotacion(t, ctx, repo, e.groupID, "Segunda votación", 2)
	si2, _, _ := crearOpcionesSiNoAbstencion(t, ctx, repo, otra)
	votar(t, ctx, repo, otra, u1, si2)
}

// GetVotedUnitIDsByVoting y GetUnvotedUnitsByVoting se reparten las unidades activas del
// negocio sin solaparse, y solo cuentan votos de esa votación.
func TestRepo_UnidadesConYSinVoto(t *testing.T) {
	ctx := testkit.Ctx(t)
	repo, database := nuevoRepo(t)
	e := nuevoEscenario(t, ctx, database, repo, []testkit.UnitSpec{
		{Number: "101", Coefficient: 40, ResidentName: "Ana IT"},
		{Number: "102", Coefficient: 30},
		{Number: "201", Coefficient: 20, ResidentName: "Beto IT"},
		{Number: "202", Coefficient: 10},
	})
	u := func(i int) uint { return e.hp.UnitID(i) }

	ids, err := repo.GetVotedUnitIDsByVoting(ctx, e.votingID)
	if err != nil {
		t.Fatalf("GetVotedUnitIDsByVoting: %v", err)
	}
	if len(ids) != 0 {
		t.Fatalf("sin votos, GetVotedUnitIDsByVoting = %v", ids)
	}

	votar(t, ctx, repo, e.votingID, u(0), e.si)
	votar(t, ctx, repo, e.votingID, u(1), e.no)

	// Un voto en otra votación del mismo grupo no debe contar en esta.
	otra := crearVotacion(t, ctx, repo, e.groupID, "Otra", 2)
	siOtra, _, _ := crearOpcionesSiNoAbstencion(t, ctx, repo, otra)
	votar(t, ctx, repo, otra, u(2), siOtra)

	ids, err = repo.GetVotedUnitIDsByVoting(ctx, e.votingID)
	if err != nil {
		t.Fatalf("GetVotedUnitIDsByVoting: %v", err)
	}
	if !equalIDs(ids, []uint{u(0), u(1)}) {
		t.Errorf("unidades que votaron = %v, se esperaba %v", ids, []uint{u(0), u(1)})
	}

	unvoted, err := repo.GetUnvotedUnitsByVoting(ctx, e.votingID, "")
	if err != nil {
		t.Fatalf("GetUnvotedUnitsByVoting: %v", err)
	}
	gotIDs := make([]uint, len(unvoted))
	for i, uu := range unvoted {
		gotIDs[i] = uu.UnitID
	}
	if !equalIDs(gotIDs, []uint{u(2), u(3)}) {
		t.Fatalf("unidades sin voto = %v, se esperaba %v", gotIDs, []uint{u(2), u(3)})
	}
	for _, uu := range unvoted {
		switch uu.UnitID {
		case u(2):
			if uu.ResidentID != e.hp.ResidentIDByUnit[u(2)] || uu.ResidentName != "Beto IT" {
				t.Errorf("unidad 201 sin voto con residente inesperado: %+v", uu)
			}
		case u(3):
			if uu.ResidentID != 0 || uu.ResidentName != "Sin residente asignado" {
				t.Errorf("unidad 202 sin residente debería indicarlo: %+v", uu)
			}
		}
	}

	// Filtro por número de unidad: "201" solo encuentra la 201.
	filtered, err := repo.GetUnvotedUnitsByVoting(ctx, e.votingID, "201")
	if err != nil {
		t.Fatalf("GetUnvotedUnitsByVoting con filtro: %v", err)
	}
	if len(filtered) != 1 || filtered[0].UnitID != u(2) {
		t.Errorf("filtro \"201\" = %+v, se esperaba solo la unidad 201", filtered)
	}

	// Una unidad inactiva no aparece como pendiente.
	if err := database.Conn(ctx).Exec("UPDATE horizontal_property.property_units SET is_active = false WHERE id = ?", u(3)).Error; err != nil {
		t.Fatalf("desactivando unidad: %v", err)
	}
	unvoted, err = repo.GetUnvotedUnitsByVoting(ctx, e.votingID, "")
	if err != nil {
		t.Fatalf("GetUnvotedUnitsByVoting: %v", err)
	}
	if len(unvoted) != 1 || unvoted[0].UnitID != u(2) {
		t.Errorf("con la 202 inactiva, sin voto = %+v, se esperaba solo la 201", unvoted)
	}
}

// DeleteAllVotesByVoting borra físicamente solo los votos de esa votación, devuelve cuántos
// borró y deja que las unidades vuelvan a votar.
func TestRepo_DeleteAllVotesByVoting(t *testing.T) {
	ctx := testkit.Ctx(t)
	repo, database := nuevoRepo(t)
	e := nuevoEscenario(t, ctx, database, repo, unidades3())
	u1, u2, u3 := e.hp.UnitID(0), e.hp.UnitID(1), e.hp.UnitID(2)

	votar(t, ctx, repo, e.votingID, u1, e.si)
	votar(t, ctx, repo, e.votingID, u2, e.no)
	votar(t, ctx, repo, e.votingID, u3, e.ab)

	otra := crearVotacion(t, ctx, repo, e.groupID, "Otra", 2)
	siOtra, _, _ := crearOpcionesSiNoAbstencion(t, ctx, repo, otra)
	votar(t, ctx, repo, otra, u1, siOtra)

	n, err := repo.DeleteAllVotesByVoting(ctx, e.votingID)
	if err != nil {
		t.Fatalf("DeleteAllVotesByVoting: %v", err)
	}
	if n != 3 {
		t.Errorf("DeleteAllVotesByVoting devolvió %d, se esperaban 3", n)
	}

	votes, err := repo.ListVotesByVoting(ctx, e.votingID)
	if err != nil {
		t.Fatalf("ListVotesByVoting: %v", err)
	}
	if len(votes) != 0 {
		t.Errorf("tras el reset quedan %d votos", len(votes))
	}
	ids, _ := repo.GetVotedUnitIDsByVoting(ctx, e.votingID)
	if len(ids) != 0 {
		t.Errorf("tras el reset GetVotedUnitIDsByVoting = %v", ids)
	}

	// La otra votación conserva su voto.
	otherVotes, err := repo.ListVotesByVoting(ctx, otra)
	if err != nil || len(otherVotes) != 1 {
		t.Errorf("la otra votación debía conservar 1 voto: %d, %v", len(otherVotes), err)
	}

	// Segundo reset: no hay nada que borrar.
	if n, err := repo.DeleteAllVotesByVoting(ctx, e.votingID); err != nil || n != 0 {
		t.Errorf("segundo reset = %d, %v; se esperaba 0", n, err)
	}

	// Borrado físico: el índice único no bloquea volver a votar.
	votar(t, ctx, repo, e.votingID, u1, e.no)
}

// Aislamiento multi-tenant: los datos de otro business_id no aparecen.
func TestRepo_AislamientoEntreNegocios(t *testing.T) {
	ctx := testkit.Ctx(t)
	repo, database := nuevoRepo(t)
	a := nuevoEscenario(t, ctx, database, repo, unidades3())
	b := nuevoEscenario(t, ctx, database, repo, []testkit.UnitSpec{
		{Number: "101", Coefficient: 60, ResidentName: "Residente de B"},
		{Number: "102", Coefficient: 40},
	})

	votar(t, ctx, repo, a.votingID, a.hp.UnitID(0), a.si)
	votar(t, ctx, repo, b.votingID, b.hp.UnitID(0), b.no)

	groupsA, err := repo.ListVotingGroupsByBusiness(ctx, a.hp.BusinessID)
	if err != nil {
		t.Fatalf("ListVotingGroupsByBusiness: %v", err)
	}
	if len(groupsA) != 1 || groupsA[0].ID != a.groupID {
		t.Errorf("grupos de A = %+v, no debe incluir el de B (%d)", groupsA, b.groupID)
	}

	aUnits := map[uint]bool{}
	for _, u := range a.hp.Units {
		aUnits[u.ID] = true
	}

	unvoted, err := repo.GetUnvotedUnitsByVoting(ctx, a.votingID, "")
	if err != nil {
		t.Fatalf("GetUnvotedUnitsByVoting: %v", err)
	}
	if len(unvoted) != 2 {
		t.Errorf("A tiene 2 unidades sin voto, se obtuvieron %d: %+v", len(unvoted), unvoted)
	}
	for _, uu := range unvoted {
		if !aUnits[uu.UnitID] {
			t.Errorf("unidad %d (%s) de otro negocio aparece como pendiente en A", uu.UnitID, uu.UnitNumber)
		}
	}

	details, err := repo.GetVotingDetailsByUnit(ctx, a.votingID, a.hp.BusinessID)
	if err != nil {
		t.Fatalf("GetVotingDetailsByUnit: %v", err)
	}
	if len(details) != len(a.hp.Units) {
		t.Errorf("detalles de A = %d unidades, se esperaban %d", len(details), len(a.hp.Units))
	}
	for _, d := range details {
		if !aUnits[d.PropertyUnitID] {
			t.Errorf("detalle de A incluye la unidad %d de otro negocio", d.PropertyUnitID)
		}
	}

	// Pedir la votación de A con el business_id de B se rechaza.
	if got, err := repo.GetVotingDetailsByUnit(ctx, a.votingID, b.hp.BusinessID); err == nil {
		t.Errorf("GetVotingDetailsByUnit(votación de A, negocio B) devolvió %d filas sin error", len(got))
	}

	withRes, err := repo.GetUnitsWithResidents(ctx, a.hp.BusinessID)
	if err != nil {
		t.Fatalf("GetUnitsWithResidents: %v", err)
	}
	for _, u := range withRes {
		if !aUnits[u.PropertyUnitID] {
			t.Errorf("GetUnitsWithResidents(A) incluye la unidad %d de otro negocio", u.PropertyUnitID)
		}
		if u.ResidentName != nil && *u.ResidentName == "Residente de B" {
			t.Errorf("GetUnitsWithResidents(A) muestra un residente de B")
		}
	}

	idsA, _ := repo.GetVotedUnitIDsByVoting(ctx, a.votingID)
	if !equalIDs(idsA, []uint{a.hp.UnitID(0)}) {
		t.Errorf("votantes de A = %v, se esperaba solo %d", idsA, a.hp.UnitID(0))
	}
}
