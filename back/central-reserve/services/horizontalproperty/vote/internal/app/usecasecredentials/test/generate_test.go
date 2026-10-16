package usecasecredentials_test

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasecredentials"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

const (
	hpID    = uint(1)
	groupID = uint(4)
)

type guardado struct {
	creds      []domain.VotingCredential
	replaceAll bool
	llamado    bool
}

func repoBase(units []uint, existentes map[uint]string, g *guardado) *mocks.MockVotingRepository {
	repo := mocks.NewMockVotingRepository()
	repo.GetVotingGroupByIDFn = func(ctx context.Context, id uint) (*domain.VotingGroup, error) {
		if id != groupID {
			return nil, nil
		}
		return &domain.VotingGroup{ID: groupID, BusinessID: hpID}, nil
	}
	repo.ListActiveUnitIDsByBusinessFn = func(ctx context.Context, b uint) ([]uint, error) {
		if b != hpID {
			return nil, nil
		}
		return units, nil
	}
	repo.ListVotingCredentialUnitIDsFn = func(ctx context.Context, gid uint) ([]uint, error) {
		var ids []uint
		for id := range existentes {
			ids = append(ids, id)
		}
		return ids, nil
	}
	repo.ListVotingCredentialsFn = func(ctx context.Context, gid uint, page, size int) ([]domain.VotingCredentialDTO, int64, error) {
		var out []domain.VotingCredentialDTO
		for id, p := range existentes {
			out = append(out, domain.VotingCredentialDTO{PropertyUnitID: id, Password: p})
		}
		return out, int64(len(out)), nil
	}
	repo.SaveVotingCredentialsFn = func(ctx context.Context, gid uint, c []domain.VotingCredential, replaceAll bool) error {
		g.creds, g.replaceAll, g.llamado = c, replaceAll, true
		return nil
	}
	repo.CountVotingCredentialsFn = func(ctx context.Context, gid uint) (int64, error) {
		if g.replaceAll {
			return int64(len(g.creds)), nil
		}
		return int64(len(existentes) + len(g.creds)), nil
	}
	return repo
}

func TestGenerate_UnaContrasenaPorUnidadActiva(t *testing.T) {
	g := &guardado{}
	uc := usecasecredentials.New(repoBase([]uint{10, 11, 12}, nil, g), mocks.NewMockLogger(), nil)
	res, err := uc.GenerateCredentials(context.Background(), groupID, false)
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if res.Generated != 3 || res.Total != 3 || len(g.creds) != 3 || g.replaceAll {
		t.Fatalf("resultado inesperado: %+v, guardado %+v", res, g)
	}
	formato := regexp.MustCompile(`^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{6}$`)
	vistas := map[string]bool{}
	for _, c := range g.creds {
		if c.BusinessID != hpID || c.VotingGroupID != groupID {
			t.Fatalf("credencial con propiedad/grupo incorrectos: %+v", c)
		}
		if !formato.MatchString(c.Password) {
			t.Fatalf("contraseña con formato inesperado: %q", c.Password)
		}
		if vistas[c.Password] {
			t.Fatalf("contraseña repetida en el grupo: %q", c.Password)
		}
		vistas[c.Password] = true
	}
}

func TestGenerate_SoloLasFaltantesYSinRepetirLasExistentes(t *testing.T) {
	g := &guardado{}
	// El generador devuelve primero la contraseña que ya usa la unidad 10: debe descartarla.
	seq := []string{"AAAAAA", "BBBBBB"}
	i := 0
	gen := func() (string, error) { p := seq[i%len(seq)]; i++; return p, nil }
	uc := usecasecredentials.New(repoBase([]uint{10, 11}, map[uint]string{10: "AAAAAA"}, g), mocks.NewMockLogger(), gen)
	res, err := uc.GenerateCredentials(context.Background(), groupID, false)
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if res.Generated != 1 || len(g.creds) != 1 || g.creds[0].PropertyUnitID != 11 || g.creds[0].Password != "BBBBBB" {
		t.Fatalf("esperaba solo la unidad 11 con BBBBBB, obtuve %+v", g.creds)
	}
	if res.Total != 2 {
		t.Fatalf("total esperado 2, obtuve %d", res.Total)
	}
}

func TestGenerate_RegenerarReemplazaTodas(t *testing.T) {
	g := &guardado{}
	n := 0
	gen := func() (string, error) { n++; return fmt.Sprintf("P%05d", n), nil }
	uc := usecasecredentials.New(repoBase([]uint{10, 11}, map[uint]string{10: "AAAAAA"}, g), mocks.NewMockLogger(), gen)
	res, err := uc.GenerateCredentials(context.Background(), groupID, true)
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if !g.replaceAll || len(g.creds) != 2 || res.Generated != 2 || res.Total != 2 {
		t.Fatalf("esperaba reemplazar las 2, obtuve %+v / %+v", res, g)
	}
}

func TestGenerate_SinUnidadesActivas(t *testing.T) {
	g := &guardado{}
	uc := usecasecredentials.New(repoBase(nil, nil, g), mocks.NewMockLogger(), nil)
	_, err := uc.GenerateCredentials(context.Background(), groupID, false)
	if !errors.Is(err, domain.ErrNoUnitsForCredentials) || g.llamado {
		t.Fatalf("esperaba ErrNoUnitsForCredentials sin guardar, obtuve %v (guardado=%v)", err, g.llamado)
	}
}

func TestGenerate_GrupoInexistente(t *testing.T) {
	g := &guardado{}
	uc := usecasecredentials.New(repoBase([]uint{1}, nil, g), mocks.NewMockLogger(), nil)
	_, err := uc.GenerateCredentials(context.Background(), 999, false)
	if !errors.Is(err, domain.ErrVotingGroupNotFound) || g.llamado {
		t.Fatalf("esperaba ErrVotingGroupNotFound, obtuve %v", err)
	}
}

func TestNormalizePassword(t *testing.T) {
	if got := usecasecredentials.NormalizePassword(" k7m 2qx\n"); got != "K7M2QX" {
		t.Fatalf("obtuve %q", got)
	}
}

func TestListCredentials_Paginacion(t *testing.T) {
	repo := mocks.NewMockVotingRepository()
	var gotPage, gotSize int
	repo.ListVotingCredentialsFn = func(ctx context.Context, gid uint, page, size int) ([]domain.VotingCredentialDTO, int64, error) {
		gotPage, gotSize = page, size
		return []domain.VotingCredentialDTO{{PropertyUnitID: 1}}, 201, nil
	}
	uc := usecasecredentials.New(repo, mocks.NewMockLogger(), nil)
	res, err := uc.ListCredentials(context.Background(), groupID, 0, 500)
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if gotPage != 1 || gotSize != 200 || res.TotalPages != 2 {
		t.Fatalf("esperaba página 1 de 200 y 2 páginas, obtuve page=%d size=%d pages=%d", gotPage, gotSize, res.TotalPages)
	}
}
